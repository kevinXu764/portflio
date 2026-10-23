(() => {
  const stage = document.querySelector("#stage");
  const h1 = document.querySelector(".hero-title");
  const canvas = document.querySelector("#hero-tech");
  const glyphs = h1 ? [...h1.querySelectorAll(".hero-glyph")] : [];
  if (!stage || !h1 || !canvas || !glyphs.length) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Courier New", monospace';
  const BLUE = "31, 112, 235";
  const STEP_MS = 1500;
  const GLIDE_S = 0.085;

  let dpr = 1;
  let width = 0;
  let height = 0;
  let canvasLeft = 0;
  let canvasTop = 0;
  let cells = [];
  let frame = null;
  let target = null;
  let active = 0;
  let raf = 0;
  let autoTimer = 0;
  let lastTime = 0;
  let pointerInside = false;
  let initialized = false;

  const canSweep = () =>
    !reduced.matches &&
    !document.hidden &&
    !stage.classList.contains("motion-paused") &&
    !stage.classList.contains("is-detail") &&
    !stage.classList.contains("has-active") &&
    !stage.classList.contains("has-copy-preview");

  const inView = () =>
    !document.hidden &&
    !stage.classList.contains("is-detail") &&
    !stage.classList.contains("has-active") &&
    !stage.classList.contains("has-copy-preview");

  function frameFor(index) {
    const cell = cells[index];
    const x = Math.max(0, cell.x);
    return {
      x,
      y: cell.y,
      w: Math.max(1, Math.min(width - x, cell.w)),
      h: Math.max(1, cell.h),
    };
  }

  function draw() {
    if (!frame || !cells.length) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const f = frame;
    const cell = cells[active];
    const labelX = Math.max(2, f.x);
    const labelY = Math.max(10, f.y - 7);

    ctx.fillStyle = `rgba(${BLUE}, 0.035)`;
    ctx.fillRect(f.x, f.y, f.w, f.h);

    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(${BLUE}, 0.62)`;
    ctx.strokeRect(
      Math.round(f.x) + 0.5,
      Math.round(f.y) + 0.5,
      Math.max(1, Math.round(f.w) - 1),
      Math.max(1, Math.round(f.h) - 1),
    );
    ctx.setLineDash([]);

    const tick = 5;
    const corners = [
      [f.x, f.y, 1, 1],
      [f.x + f.w, f.y, -1, 1],
      [f.x, f.y + f.h, 1, -1],
      [f.x + f.w, f.y + f.h, -1, -1],
    ];
    ctx.strokeStyle = `rgba(${BLUE}, 0.95)`;
    ctx.beginPath();
    corners.forEach(([x, y, sx, sy]) => {
      const cx = Math.round(x) + 0.5;
      const cy = Math.round(y) + 0.5;
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + sx * tick, cy);
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx, cy + sy * tick);
    });
    ctx.stroke();

    ctx.font = `500 10px ${MONO}`;
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "rgba(30, 68, 126, 0.9)";
    const dims = `${String(Math.round(cell.w)).padStart(3, "0")} × ${String(Math.round(cell.h)).padStart(3, "0")}`;
    const label = `${cell.letter}  ${dims}`;
    const safeLabelX = Math.min(labelX, Math.max(2, width - ctx.measureText(label).width - 2));
    ctx.fillText(label, safeLabelX, labelY);

    ctx.restore();
  }

  function settleToTarget() {
    if (!target) return;
    frame = { ...target };
    draw();
    if (canSweep() && !pointerInside) scheduleAuto();
  }

  function step(now) {
    raf = 0;
    if (!frame || !target) return;
    const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
    lastTime = now;
    const ease = 1 - Math.exp(-dt / GLIDE_S);
    frame.x += (target.x - frame.x) * ease;
    frame.y += (target.y - frame.y) * ease;
    frame.w += (target.w - frame.w) * ease;
    frame.h += (target.h - frame.h) * ease;
    draw();
    const settled =
      Math.abs(target.x - frame.x) < 0.4 &&
      Math.abs(target.y - frame.y) < 0.4 &&
      Math.abs(target.w - frame.w) < 0.4 &&
      Math.abs(target.h - frame.h) < 0.4;
    if (!settled) raf = requestAnimationFrame(step);
    else settleToTarget();
  }

  function wake() {
    if (raf) return;
    lastTime = performance.now();
    raf = requestAnimationFrame(step);
  }

  function scheduleAuto(delay = STEP_MS) {
    clearTimeout(autoTimer);
    autoTimer = 0;
    if (!canSweep()) return;
    autoTimer = window.setTimeout(() => {
      autoTimer = 0;
      if (!canSweep() || pointerInside) return;
      setActive(active + 1);
    }, delay);
  }

  function setActive(index, { immediate = false } = {}) {
    if (!cells.length) return;
    const next = ((index % cells.length) + cells.length) % cells.length;
    active = next;
    glyphs.forEach((glyph, i) => glyph.classList.toggle("is-scanned", i === next));
    target = frameFor(next);
    if (immediate || !frame) {
      frame = { ...target };
      draw();
      return;
    }
    wake();
  }

  function measure() {
    const box = h1.getBoundingClientRect();
    const cbox = canvas.getBoundingClientRect();
    if (box.width < 1 || cbox.width < 1 || cbox.height < 1) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    width = cbox.width;
    height = cbox.height;
    canvasLeft = cbox.left;
    const pixelWidth = Math.round(width * dpr);
    const pixelHeight = Math.round(height * dpr);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    const cs = getComputedStyle(h1);
    const fontSize = parseFloat(cs.fontSize) || box.height;
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const baseMetrics = ctx.measureText("Mg");
    const ascent = Number.isFinite(baseMetrics.fontBoundingBoxAscent)
      ? baseMetrics.fontBoundingBoxAscent
      : fontSize * 0.8;
    const descent = Number.isFinite(baseMetrics.fontBoundingBoxDescent)
      ? baseMetrics.fontBoundingBoxDescent
      : fontSize * 0.2;
    canvasTop = cbox.top;
    cells = glyphs.map((glyph) => {
      const r = glyph.getBoundingClientRect();
      const line = glyph.closest(".hero-line") || h1;
      const lineRect = line.getBoundingClientRect();
      const lineHeight = parseFloat(getComputedStyle(line).lineHeight) || fontSize * 1.15;
      const baseline = lineRect.top - cbox.top + (lineHeight - (ascent + descent)) / 2 + ascent;
      const metrics = ctx.measureText(glyph.textContent.trim());
      const origin = r.left - cbox.left;
      const inkLeft = origin - (Number.isFinite(metrics.actualBoundingBoxLeft) ? metrics.actualBoundingBoxLeft : -r.width * 0.03);
      const inkRight = origin + (Number.isFinite(metrics.actualBoundingBoxRight) ? metrics.actualBoundingBoxRight : r.width * 0.97);
      const inkTop = baseline - (Number.isFinite(metrics.actualBoundingBoxAscent) ? metrics.actualBoundingBoxAscent : fontSize * 0.72);
      const inkBottom = baseline + (Number.isFinite(metrics.actualBoundingBoxDescent) ? metrics.actualBoundingBoxDescent : 0);
      return {
        letter: glyph.textContent.trim(),
        x: inkLeft,
        w: Math.max(1, inkRight - inkLeft),
        y: inkTop,
        h: Math.max(1, inkBottom - inkTop),
        cx: inkLeft + Math.max(1, inkRight - inkLeft) / 2,
        cy: inkTop + Math.max(1, inkBottom - inkTop) / 2,
      };
    });
    if (!cells.length) return;
    if (!initialized) {
      initialized = true;
      setActive(0, { immediate: true });
    } else {
      target = frameFor(active);
      frame = { ...target };
      draw();
    }
  }

  function sync() {
    if (!initialized) return;
    if (!inView()) {
      clearTimeout(autoTimer);
      autoTimer = 0;
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      return;
    }
    if (reduced.matches) {
      clearTimeout(autoTimer);
      autoTimer = 0;
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      setActive(active, { immediate: true });
      return;
    }
    if (!canSweep()) {
      clearTimeout(autoTimer);
      autoTimer = 0;
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      draw();
      return;
    }
    if (!raf) {
      const unsettled = target && frame && (
        Math.abs(target.x - frame.x) > 0.4 ||
        Math.abs(target.y - frame.y) > 0.4 ||
        Math.abs(target.w - frame.w) > 0.4 ||
        Math.abs(target.h - frame.h) > 0.4
      );
      if (unsettled) wake();
      else {
        draw();
        if (!pointerInside) scheduleAuto(900);
      }
    }
  }

  h1.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" || event.buttons || reduced.matches || !canSweep() || !cells.length) return;
    pointerInside = true;
    clearTimeout(autoTimer);
    autoTimer = 0;
    let next = 0;
    let best = Infinity;
    cells.forEach((cell, index) => {
      const dx = event.clientX - (canvasLeft + cell.cx);
      const dy = event.clientY - (canvasTop + cell.cy);
      const distance = dx * dx + dy * dy;
      if (distance < best) {
        best = distance;
        next = index;
      }
    });
    if (next !== active) setActive(next);
    else if (!raf) draw();
  });

  h1.addEventListener("pointerleave", () => {
    pointerInside = false;
    if (!raf) draw();
    if (canSweep()) scheduleAuto(900);
  });

  new ResizeObserver(() => measure()).observe(h1);
  window.addEventListener("resize", measure, { passive: true });
  new MutationObserver(sync).observe(stage, { attributes: true, attributeFilter: ["class"] });
  document.addEventListener("visibilitychange", sync);
  reduced.addEventListener?.("change", () => {
    if (reduced.matches) pointerInside = false;
    sync();
  });

  measure();
  sync();
  document.fonts?.ready.then(() => {
    measure();
    sync();
  });
})();
