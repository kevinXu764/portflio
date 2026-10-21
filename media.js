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
  dialog.innerHTML = '<button class="image-preview-close" type="button" aria-label="关闭图片预览">×</button><div class="image-preview-content"></div>';
  document.body.append(dialog); watchMedia(dialog);
  let trigger;
  root.addEventListener('click', event => {
    const link = event.target.closest('[data-image-preview]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (typeof dialog.showModal !== 'function') return; // ordinary same-tab image link as fallback
    event.preventDefault(); trigger = link;
    const alt = link.querySelector('img').alt;
    dialog.querySelector('.image-preview-content').innerHTML = `<div class="image-preview-figure media-image" data-image-state="loading" aria-busy="true"><img src="${escape(previewPath(link.getAttribute('href')))}" data-full-src="${escape(link.getAttribute('href'))}" data-image-resolution="preview" alt="${escape(alt)}"><span class="media-status" aria-hidden="true"><span class="media-spinner"></span><span class="media-label">图片加载中</span></span></div>`;
    dialog.showModal();
    const img = dialog.querySelector('img'); track(img); upgrade(img, 'high');
  });
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog || event.target.classList.contains('image-preview-content') || event.target.classList.contains('image-preview-figure')) dialog.close();
    if (event.target instanceof HTMLImageElement && event.target.naturalWidth) {
      const img = event.target, box = img.getBoundingClientRect();
      const scale = Math.min(box.width / img.naturalWidth, box.height / img.naturalHeight);
      const left = box.left + (box.width - img.naturalWidth * scale) / 2;
      const top = box.top + (box.height - img.naturalHeight * scale) / 2;
      if (event.clientX < left || event.clientX > left + img.naturalWidth * scale || event.clientY < top || event.clientY > top + img.naturalHeight * scale) dialog.close();
    }
  });
  // Consume this Escape before the site's Escape-to-return shortcut.
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && dialog.open) {event.preventDefault(); event.stopImmediatePropagation(); dialog.close()}
  }, true);
  dialog.addEventListener('close', () => {dialog.querySelector('.image-preview-content').replaceChildren(); trigger?.focus({preventScroll: true})});
  window.addEventListener('hashchange', () => {if (dialog.open) dialog.close()});
}
