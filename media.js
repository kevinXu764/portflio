// Lightweight previews paint first; nearby images upgrade during idle time.
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const previewPath = src => src.replace(/\/([^/]+)\.[^.]+$/, '/previews/$1.webp');
const tracked = new WeakMap(), queued = new WeakSet(), jobs = [];
let active = 0, idlePending = false, nearObserver;

export function imageLink({src, displaySrc = src, alt, width, height, className, eager = false}) {
  return `<a class="${className} media-image" href="${escape(src)}" data-image-preview aria-haspopup="dialog" data-image-state="loading" aria-busy="true" aria-label="查看大图：${escape(alt)}"><img src="${escape(previewPath(displaySrc))}" data-full-src="${escape(displaySrc)}" data-image-resolution="preview" width="${width}" height="${height}" alt="${escape(alt)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async"><span class="media-status" aria-hidden="true"><span class="media-spinner"></span><span class="media-label">图片加载中</span></span></a>`;
}

function nearby(img) {
  const box = img.getBoundingClientRect();
  return box.width > 0 && box.height > 0 && box.bottom > -320 && box.top < innerHeight + 320;
}

function schedule() {
  if (idlePending || active >= 2 || !jobs.length) return;
  idlePending = true;
  const run = () => {
    idlePending = false;
    while (active < 2 && jobs.length) {
      const img = jobs.shift();
      queued.delete(img);
      if (!nearby(img)) continue;
      active++;
      upgrade(img).finally(() => {active--; schedule()});
    }
  };
  if ('requestIdleCallback' in window) requestIdleCallback(run, {timeout: 1200});
  else setTimeout(run, 180);
}

function enqueue(img) {
  if (!img.dataset.fullSrc || img.dataset.imageResolution === 'full' || queued.has(img) || !nearby(img)) return;
  queued.add(img); jobs.push(img); schedule();
}

async function upgrade(img, priority = 'low') {
  const state = tracked.get(img);
  if (!state || state.upgrading || img.dataset.imageResolution === 'full') return;
  state.upgrading = true;
  const full = new Image(); full.decoding = 'async'; full.fetchPriority = priority;
  let timer;
  try {
    const loaded = new Promise((resolve, reject) => {
      full.onload = resolve; full.onerror = reject; full.src = img.dataset.fullSrc;
    });
    await Promise.race([loaded, new Promise((_, reject) => {timer = setTimeout(reject, 15000)})]);
    if (full.decode) await full.decode();
    img.src = img.dataset.fullSrc;
    img.dataset.imageResolution = 'full';
    state.finish('ready');
    nearObserver?.unobserve(img);
  } catch {
    // A failed full-size request keeps the usable preview on screen.
    if (!img.naturalWidth) state.finish('error');
  } finally {
    clearTimeout(timer); full.onload = full.onerror = null; state.upgrading = false;
  }
}

function track(img) {
  if (tracked.has(img)) return tracked.get(img).ready;
  const link = img.closest('.media-image');
  let resolveReady, settled = false;
  const ready = new Promise(resolve => {resolveReady = resolve});
  const finish = status => {
    if (link) {
      link.dataset.imageState = status; link.removeAttribute('aria-busy');
      if (status === 'error') link.querySelector('.media-label').textContent = '图片未能载入';
    }
    if (!settled) {settled = true; resolveReady(status)}
  };
  const state = {ready, finish, upgrading: false}; tracked.set(img, state);
  const loaded = async () => {
    if (!img.naturalWidth) return failed();
    if (img.decode) await img.decode().catch(() => {});
    finish('ready'); enqueue(img);
  };
  const failed = () => {
    if (img.dataset.imageResolution === 'full' || !img.dataset.fullSrc) return finish('error');
    upgrade(img, 'high');
  };
  img.addEventListener('load', loaded); img.addEventListener('error', failed);
  if (img.complete) img.naturalWidth ? loaded() : failed();
  if ('IntersectionObserver' in window) {
    nearObserver ||= new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting && entry.target.complete && entry.target.naturalWidth) enqueue(entry.target);
    }), {rootMargin: '320px'});
    nearObserver.observe(img);
  }
  return ready;
}

export function watchMedia(root) {
  const scan = node => {
    if (!(node instanceof Element)) return;
    if (node.matches('img[data-full-src]')) track(node);
    node.querySelectorAll('img[data-full-src]').forEach(track);
  };
  scan(root);
  new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(scan)))
    .observe(root, {childList: true, subtree: true});
}

export async function prepareImages(root, timeout = 1100) {
  const viewport = root.getBoundingClientRect();
  const images = [...root.querySelectorAll('img[src]')].filter(img => {
    const box = img.getBoundingClientRect();
    return box.width > 0 && box.height > 0 && box.bottom > viewport.top && box.top < viewport.bottom && box.right > viewport.left && box.left < viewport.right;
  }).slice(0, 3);
  let timer;
  const pending = images.map(img => {img.loading = 'eager'; img.fetchPriority = 'high'; return track(img)});
  await Promise.race([Promise.allSettled(pending), new Promise(resolve => {timer = setTimeout(resolve, timeout)})]);
  clearTimeout(timer);
}

export function setupImagePreview(root) {
  const dialog = document.createElement('dialog');
  dialog.className = 'image-preview'; dialog.setAttribute('aria-label', '图片预览');
  dialog.setAttribute('aria-description', '双击或双指缩放图片，放大后拖动查看。也可使用加减键缩放、方向键移动、0 键复位，Escape 关闭。');
  dialog.innerHTML = '<button class="image-preview-close" type="button" aria-label="关闭图片预览">×</button><div class="image-preview-content"></div>';
  document.body.append(dialog); watchMedia(dialog);
  const content = dialog.querySelector('.image-preview-content');
  const pointers = new Map();
  let trigger, image, scale = 1, offsetX = 0, offsetY = 0, gesture;
  let ignoreClickUntil = 0, lastTap, touchZoomAt = 0;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const point = event => ({x: event.clientX, y: event.clientY});
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const center = () => {
    const box = content.getBoundingClientRect();
    return {x: box.left + box.width / 2, y: box.top + box.height / 2};
  };
  const render = () => {
    if (!image) return;
    const box = content.getBoundingClientRect();
    const fit = image.naturalWidth ? Math.min(box.width / image.naturalWidth, box.height / image.naturalHeight) : 0;
    const maxX = Math.max(0, (image.naturalWidth * fit * scale - box.width) / 2);
    const maxY = Math.max(0, (image.naturalHeight * fit * scale - box.height) / 2);
    offsetX = clamp(offsetX, -maxX, maxX); offsetY = clamp(offsetY, -maxY, maxY);
    image.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    dialog.classList.toggle('is-zoomed', scale > 1);
  };
  const reset = () => {
    pointers.clear(); gesture = lastTap = undefined; ignoreClickUntil = touchZoomAt = 0;
    scale = 1; offsetX = offsetY = 0; render();
    dialog.classList.remove('is-dragging');
  };
  const clearPreview = () => {reset(); content.replaceChildren(); image = undefined};
  const close = () => {
    if (!dialog.open) return;
    clearPreview(); dialog.close(); trigger?.focus({preventScroll: true});
  };
  const zoom = (next, at = center()) => {
    const previous = scale, origin = center();
    scale = clamp(next, 1, 8);
    offsetX = at.x - origin.x - (at.x - origin.x - offsetX) * scale / previous;
    offsetY = at.y - origin.y - (at.y - origin.y - offsetY) * scale / previous;
    render();
  };
  const beginGesture = () => {
    const points = [...pointers.values()];
    if (!points.length) {gesture = undefined; return}
    const mid = points.length > 1 ? {x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2} : points[0];
    gesture = {mid, distance: points.length > 1 ? distance(points[0], points[1]) : 0, scale, x: offsetX, y: offsetY, moved: points.length > 1};
  };
  root.addEventListener('click', event => {
    const link = event.target.closest('[data-image-preview]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (typeof dialog.showModal !== 'function') return; // ordinary same-tab image link as fallback
    event.preventDefault(); trigger = link;
    const alt = link.querySelector('img').alt;
    content.innerHTML = `<div class="image-preview-figure media-image" data-image-state="loading" aria-busy="true"><img src="${escape(previewPath(link.getAttribute('href')))}" data-full-src="${escape(link.getAttribute('href'))}" data-image-resolution="preview" alt="${escape(alt)}" draggable="false"><span class="media-status" aria-hidden="true"><span class="media-spinner"></span><span class="media-label">图片加载中</span></span></div>`;
    image = content.querySelector('img'); ignoreClickUntil = touchZoomAt = 0;
    reset(); dialog.showModal(); render();
    image.addEventListener('load', render); track(image); upgrade(image, 'high');
  });
  // Keep zoom within the image; do not change viewport metadata or the reader's page zoom.
  dialog.addEventListener('wheel', event => {
    if (!dialog.open || event.target.closest('button')) return;
    event.preventDefault();
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? content.clientHeight : 1);
    zoom(scale * Math.exp(-delta * 0.002), point(event));
  }, {passive: false});
  content.addEventListener('pointerdown', event => {
    if (!image || event.button !== 0) return;
    if (!pointers.size) ignoreClickUntil = 0;
    pointers.set(event.pointerId, point(event));
    event.target.setPointerCapture(event.pointerId);
    beginGesture();
    if (scale > 1) dialog.classList.add('is-dragging');
  });
  content.addEventListener('pointermove', event => {
    if (!gesture || !pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, point(event));
    const points = [...pointers.values()], origin = center();
    const mid = points.length > 1 ? {x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2} : points[0];
    if (points.length > 1 && gesture.distance) {
      scale = clamp(gesture.scale * distance(points[0], points[1]) / gesture.distance, 1, 8);
      offsetX = mid.x - origin.x - (gesture.mid.x - origin.x - gesture.x) * scale / gesture.scale;
      offsetY = mid.y - origin.y - (gesture.mid.y - origin.y - gesture.y) * scale / gesture.scale;
    } else if (scale > 1) {
      offsetX = gesture.x + mid.x - gesture.mid.x; offsetY = gesture.y + mid.y - gesture.mid.y;
    }
    gesture.moved ||= distance(mid, gesture.mid) > 5;
    if (gesture.moved) ignoreClickUntil = performance.now() + 500;
    render();
  });
  const endGesture = event => {
    if (!pointers.has(event.pointerId)) return;
    const moved = gesture?.moved;
    pointers.delete(event.pointerId);
    if (moved || event.type !== 'pointerup') {ignoreClickUntil = performance.now() + 500; lastTap = undefined}
    else if (event.pointerType === 'touch' && !pointers.size) {
      const now = performance.now(), at = point(event);
      if (lastTap && now - lastTap.time < 320 && distance(at, lastTap.at) < 24) {
        zoom(scale > 1 ? 1 : 2.5, at); touchZoomAt = now; ignoreClickUntil = now + 500; lastTap = undefined;
      } else lastTap = {time: now, at};
    }
    beginGesture();
    if (!pointers.size) dialog.classList.remove('is-dragging');
  };
  content.addEventListener('pointerup', endGesture);
  content.addEventListener('pointercancel', endGesture);
  content.addEventListener('lostpointercapture', endGesture);
  content.addEventListener('dblclick', event => {
    event.preventDefault();
    if (touchZoomAt && performance.now() - touchZoomAt < 500) return;
    zoom(scale > 1 ? 1 : 2.5, point(event));
  });
  dialog.addEventListener('pointerdown', event => {if (!content.contains(event.target)) ignoreClickUntil = 0}, true);
  dialog.querySelector('button').addEventListener('click', close);
  dialog.addEventListener('cancel', event => {event.preventDefault(); close()});
  dialog.addEventListener('click', event => {
    if (performance.now() < ignoreClickUntil && !event.target.closest('button')) {event.preventDefault(); return}
    if (event.target === dialog || event.target.classList.contains('image-preview-content') || event.target.classList.contains('image-preview-figure')) close();
    if (event.target instanceof HTMLImageElement && event.target.naturalWidth) {
      const img = event.target, box = img.getBoundingClientRect();
      const fit = Math.min(box.width / img.naturalWidth, box.height / img.naturalHeight);
      const left = box.left + (box.width - img.naturalWidth * fit) / 2;
      const top = box.top + (box.height - img.naturalHeight * fit) / 2;
      if (event.clientX < left || event.clientX > left + img.naturalWidth * fit || event.clientY < top || event.clientY > top + img.naturalHeight * fit) close();
    }
  });
  // Consume this Escape before the site's Escape-to-return shortcut.
  document.addEventListener('keydown', event => {
    if (!dialog.open) return;
    if (event.key === 'Escape') {event.preventDefault(); event.stopImmediatePropagation(); close()}
    else if (!event.ctrlKey && !event.metaKey && !event.altKey) {
      if (event.key === '+' || event.key === '=') {event.preventDefault(); zoom(scale * 1.5)}
      else if (event.key === '-') {event.preventDefault(); zoom(scale / 1.5)}
      else if (event.key === '0') {event.preventDefault(); reset()}
      else if (scale > 1 && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        offsetX += event.key === 'ArrowLeft' ? 60 : event.key === 'ArrowRight' ? -60 : 0;
        offsetY += event.key === 'ArrowUp' ? 60 : event.key === 'ArrowDown' ? -60 : 0; render();
      }
    }
  }, true);
  dialog.addEventListener('close', () => {if (!dialog.open) {clearPreview(); trigger?.focus({preventScroll: true})}});
  window.addEventListener('resize', () => {if (dialog.open) {reset(); render()}});
  window.addEventListener('hashchange', close);
}
