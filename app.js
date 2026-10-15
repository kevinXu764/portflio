import * as THREE from "./vendor/three.module.min.js";
import { zhuozaiProject, renderZhuozaiCase, bindZhuozaiCase } from "./cases/zhuozai/case.js";

const projects = [
  zhuozaiProject,
  {
    number: "01",
    slug: "brand-atlas",
    title: "Brand Atlas",
    cnTitle: "品牌视觉档案",
    category: "品牌策略 · 视觉系统",
    year: "2026",
    role: "设计主导",
    duration: "12 周",
    description: "把散落的品牌资产，整理成一套有秩序、可生长的视觉语言。",
    challenge: "品牌经过快速扩张后，线上产品、线下物料和团队表达逐渐分裂。项目需要在保留原有识别度的同时，建立一套足够灵活的系统。",
    approach: "从内容优先级出发重建网格，以“目录索引”为核心意象，将字体、留白与模块比例组织为可复用的视觉语法。",
    outcomes: ["覆盖 5 类触点", "建立 24 个模板", "交付双端规范"],
    tone: "#0c5cad",
    mark: "A—01",
  },
  {
    number: "02",
    slug: "move-with-me",
    title: "Move With Me",
    cnTitle: "运动生活产品",
    category: "产品设计 · 移动体验",
    year: "2025",
    role: "体验设计",
    duration: "10 周",
    description: "为日常运动建立轻量、持续、有呼吸感的记录体验。",
    challenge: "用户并不缺少数据，而是容易在复杂目标和密集反馈中失去节奏。设计需要把每次行动变得轻松，同时让长期变化清晰可见。",
    approach: "用自然语言替代数据墙，以单手操作路径、渐进式目标和柔和反馈构成每天都愿意打开的运动陪伴。",
    outcomes: ["核心流程缩短 42%", "7 日任务完成率提升", "覆盖 3 种运动模式"],
    tone: "#087541",
    mark: "M—02",
  },
  {
    number: "03",
    slug: "quiet-type",
    title: "Quiet Type",
    cnTitle: "编辑与字体实验",
    category: "编辑设计 · 字体研究",
    year: "2025",
    role: "视觉设计",
    duration: "6 周",
    description: "让文字退后半步，让阅读本身成为画面的主角。",
    challenge: "当内容横跨长文、引语、数据与图注时，过度装饰会打断阅读，而单一节奏又难以维持注意力。",
    approach: "以有限字号层级、动态行宽与可变密度构建编辑系统，让版面在安静中保持清晰的节拍。",
    outcomes: ["完成 68 页样刊", "建立 9 个版式母版", "适配中英双语"],
    tone: "#c54334",
    mark: "Q—03",
  },
  {
    number: "04",
    slug: "civic-signal",
    title: "Civic Signal",
    cnTitle: "城市公共导视",
    category: "信息设计 · 服务体验",
    year: "2024",
    role: "研究与设计",
    duration: "14 周",
    description: "把复杂的城市路径，转化成每个人都能快速理解的信号。",
    challenge: "老城区的多层空间与临时动线让方向判断变得困难，原有标识在视距、语言和无障碍层面均缺少一致规则。",
    approach: "从真实步行任务出发梳理决策点，用分层信息、统一方位语言与高辨识编号重构完整导视旅程。",
    outcomes: ["覆盖 17 个决策点", "平均寻路时间下降", "完成无障碍走查"],
    tone: "#b78412",
    mark: "C—04",
  },
  {
    number: "05",
    slug: "objects-at-rest",
    title: "Objects at Rest",
    cnTitle: "物件与材质研究",
    category: "艺术指导 · 影像系统",
    year: "2023",
    role: "艺术指导",
    duration: "8 周",
    description: "在克制的光线里，重新观察熟悉物件的比例与触感。",
    challenge: "系列包含不同尺度和材质的物件，需要在不依赖强烈色彩的情况下形成统一识别，同时保留每件物品独有的触感。",
    approach: "以固定视角、灰阶关系和细微光比建立拍摄语法，再通过一致的裁切系统连接印刷与数字端。",
    outcomes: ["完成 36 件拍摄", "形成 4 套陈列规则", "同步数字与印刷输出"],
    tone: "#6e356f",
    mark: "O—05",
  },
].map((project, index) => ({ ...project, number: String(index + 1).padStart(2, "0") }));

const stage = document.querySelector("#stage");
const sceneCanvas = document.querySelector("#scene");
const collection = document.querySelector("#collection");
const intro = document.querySelector("#intro");
const gestureCue = document.querySelector("#gesture-cue");
const stageFooter = document.querySelector("#stage-footer");
const activeCopy = document.querySelector("#active-copy");
const activeDescription = document.querySelector("#active-description");
const activeCategory = document.querySelector("#active-category");
const activeYear = document.querySelector("#active-year");
const projectCount = document.querySelector("#project-count");
const previousProject = document.querySelector("#previous-project");
const nextProject = document.querySelector("#next-project");
const liveStatus = document.querySelector("#live-status");
const cards = [...document.querySelectorAll("[data-card]")];

const detailView = document.querySelector("#detail-view");
const detailBack = document.querySelector("#detail-back");
const detailCount = document.querySelector("#detail-count");
const detailHero = document.querySelector("#detail-hero");
const detailMark = document.querySelector("#detail-mark");
const detailKicker = document.querySelector("#detail-kicker");
const detailTitle = document.querySelector("#detail-title");
const detailCnTitle = document.querySelector("#detail-cn-title");
const detailRole = document.querySelector("#detail-role");
const detailDuration = document.querySelector("#detail-duration");
const detailYear = document.querySelector("#detail-year");
const detailDescription = document.querySelector("#detail-description");
const detailChallenge = document.querySelector("#detail-challenge");
const detailApproach = document.querySelector("#detail-approach");
const detailOutcomes = document.querySelector("#detail-outcomes");
const nextDetail = document.querySelector("#next-detail");
const nextDetailTitle = document.querySelector("#next-detail-title");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const lowPowerDevice =
  (Number.isFinite(navigator.deviceMemory) && navigator.deviceMemory <= 4) ||
  (Number.isFinite(navigator.hardwareConcurrency) && navigator.hardwareConcurrency <= 4);
const pixelBudget = lowPowerDevice ? 2400000 : 4200000;
const rotations = [-6, 4, -3, 5, -1, 3];
const xOffsets = [0, -5, 4, -3, 2, -4];

const metrics = {
  threeRevision: THREE.REVISION,
  webgl: false,
  lowPowerDevice,
  pixelRatio: 1,
  frames: 0,
  averageFrameMs: 0,
  maxFrameMs: 0,
  renderSamples: 0,
  averageRenderMs: 0,
  maxRenderMs: 0,
  lastAnimationMs: 0,
  drawCalls: 0,
  triangles: 0,
  longTasks: 0,
  rafActive: false,
  lineTextureDepthTest: true,
  mutedGrayBlend: 0.56,
  copyVisible: false,
  copyProjectIndex: -1,
  copyFocusY: 0,
  copyDistance: null,
  copyEnterRange: 0,
  copyExitRange: 0,
  copyTransitions: 0,
  cardTopPositions: Array(projects.length).fill(0),
  bootRevealed: false,
  bootRevealMs: null,
};
window.__myAssetsThreeMetrics = metrics;

function revealPrototype() {
  requestAnimationFrame(() => {
    document.documentElement.classList.remove("prototype-booting");
    document.documentElement.classList.add("prototype-ready");
    metrics.bootRevealed = true;
    metrics.bootRevealMs = Number(performance.now().toFixed(1));
  });
}

if ("PerformanceObserver" in window) {
  try {
    const longTaskObserver = new PerformanceObserver((list) => {
      metrics.longTasks += list.getEntries().length;
    });
    longTaskObserver.observe({ type: "longtask", buffered: true });
  } catch {
    // Long task observation is optional and browser-dependent.
  }
}

let renderer = null;
let threeScene = null;
let camera = null;
let cardGeometry = null;
let lineGeometry = null;
let meshes = [];
let materials = [];
let lineMeshes = [];
let lineMaterials = [];
let toneColors = [];
const softGrayColor = new THREE.Color("#d6d6d2");

function updateTypeScale() {
  const rootSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  document.documentElement.classList.toggle("large-type", rootSize >= 24);
}

let stageWidth = 390;
let stageHeight = 844;
let cardWidth = 350;
let cardHeight = 224;
let wideLayout = false;
let cardCenterX = 195;
let backgroundPaused = false;
let ownsDetailHistory = false;
let initialized = false;
let activeIndex = -1;
let detailIndex = -1;
let detailOpen = false;
let wheelAccumulator = 0;
let wheelLocked = false;
let suppressClick = false;
let rafId = 0;
let previousFrameTime = 0;
let animationStartedAt = 0;
let frameTimeTotal = 0;

const copyState = {
  visible: false,
  index: -1,
};

const drag = {
  active: false,
  pointerId: null,
  startY: 0,
  lastY: 0,
  lastTime: 0,
  offset: 0,
  velocity: 0,
  moved: false,
  captured: false,
};

const motions = projects.map(() => ({
  x: 0,
  y: 0,
  rotation: 0,
  scale: 1,
  tiltX: 0,
  tiltY: 0,
  opacity: 1,
  vx: 0,
  vy: 0,
  vrotation: 0,
  vscale: 0,
  vtiltX: 0,
  vtiltY: 0,
  vopacity: 0,
}));

function createRoundedCardShape() {
  const width = 1;
  const height = 0.64;
  const radius = 0.052;
  const left = -width / 2;
  const right = width / 2;
  const bottom = -height / 2;
  const top = height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(left + radius, bottom);
  shape.lineTo(right - radius, bottom);
  shape.quadraticCurveTo(right, bottom, right, bottom + radius);
  shape.lineTo(right, top - radius);
  shape.quadraticCurveTo(right, top, right - radius, top);
  shape.lineTo(left + radius, top);
  shape.quadraticCurveTo(left, top, left, top - radius);
  shape.lineTo(left, bottom + radius);
  shape.quadraticCurveTo(left, bottom, left + radius, bottom);
  return shape;
}

function createRoundedCardGeometry(shape) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.026,
    steps: 1,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.011,
    bevelThickness: 0.009,
    curveSegments: 12,
  });
  geometry.center();
  geometry.computeBoundingBox();
  geometry.computeVertexNormals();
  return geometry;
}

function drawRoundedRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function createLineTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 656;
  const context = canvas.getContext("2d");
  context.scale(2, 2);
  const width = 512, height = 328;
  context.fillStyle = "#000";
  context.fillRect(0, 0, width, height);

  context.lineWidth = 1.25;
  context.strokeStyle = "rgba(255, 255, 255, 0.16)";
  for (let x = 54; x < width; x += 64) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }

  context.lineWidth = 2;
  context.strokeStyle = "rgba(255, 255, 255, 0.27)";
  drawRoundedRect(context, 18, 18, width - 36, height - 36, 38);
  context.stroke();

  context.lineWidth = 1.5;
  context.strokeStyle = "rgba(255, 255, 255, 0.13)";
  [62, 110, 158].forEach((radius) => {
    context.beginPath();
    context.arc(width * 0.77, height * 0.88, radius, Math.PI * 0.96, Math.PI * 1.9);
    context.stroke();
  });

  context.lineWidth = 14;
  context.strokeStyle = "rgba(255, 255, 255, 0.055)";
  context.beginPath();
  context.moveTo(width * 0.42, height);
  context.lineTo(width * 0.64, 0);
  context.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function initThree() {
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: sceneCanvas,
      alpha: true,
      antialias: true,
      depth: true,
      stencil: false,
      powerPreference: "default",
      preserveDrawingBuffer: false,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    threeScene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-195, 195, 422, -422, -1000, 1000);
    camera.position.set(0, 0, 600);
    camera.lookAt(0, 0, 0);

    const hemisphere = new THREE.HemisphereLight(0xffffff, 0x4b4a45, 1.75);
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(-180, 240, 420);
    const rim = new THREE.DirectionalLight(0x9fc9ff, 0.7);
    rim.position.set(240, -120, 220);
    threeScene.add(hemisphere, key, rim);

    const cardShape = createRoundedCardShape();
    cardGeometry = createRoundedCardGeometry(cardShape);
    lineGeometry = new THREE.ShapeGeometry(cardShape, 12);
    const positions = lineGeometry.attributes.position;
    const uv = lineGeometry.attributes.uv;
    for (let i = 0; i < positions.count; i++) {
      uv.setXY(i, positions.getX(i) + 0.5, (positions.getY(i) + 0.32) / 0.64);
    }
    uv.needsUpdate = true;
    const lineTexture = createLineTexture();
    toneColors = projects.map((project) => new THREE.Color(project.tone));
    materials = projects.map((project) => new THREE.MeshStandardMaterial({
      color: project.tone,
      roughness: 0.5,
      metalness: 0.05,
      transparent: false,
      depthWrite: true,
    }));
    lineMaterials = projects.map(() => new THREE.MeshBasicMaterial({
      color: 0xffffff,
      alphaMap: lineTexture,
      transparent: true,
      opacity: 1,
      alphaTest: 0.01,
      depthTest: true,
      depthWrite: false,
      toneMapped: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    }));
    meshes = materials.map((material, index) => {
      const mesh = new THREE.Mesh(cardGeometry, material);
      const lineMesh = new THREE.Mesh(lineGeometry, lineMaterials[index]);
      lineMesh.position.z = (cardGeometry.boundingBox?.max.z || 0.024) + 0.0015;
      lineMesh.frustumCulled = true;
      mesh.add(lineMesh);
      lineMeshes.push(lineMesh);
      mesh.frustumCulled = true;
      threeScene.add(mesh);
      return mesh;
    });

    renderer.domElement.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      metrics.webgl = false;
      document.documentElement.classList.remove("webgl");
      document.documentElement.classList.add("no-webgl");
    });
    renderer.domElement.addEventListener("webglcontextrestored", () => {
      metrics.webgl = true;
      document.documentElement.classList.add("webgl");
      document.documentElement.classList.remove("no-webgl");
      scheduleFrame();
    });

    metrics.webgl = true;
    document.documentElement.classList.add("webgl");
  } catch (error) {
    renderer = null;
    metrics.webgl = false;
    document.documentElement.classList.add("no-webgl");
    console.warn("WebGL unavailable; using the DOM card fallback.", error?.message || error);
  }
}

const targets = projects.map(() => ({}));
function focusY() {
  if (wideLayout) return stageHeight * 0.23;
  // Leave room for readable copy and a separate navigation row on short phones.
  return Math.max(84, stageHeight * (stageHeight <= 640 ? 0.15 : 0.19));
}
function cardTarget(index) {
  let y;
  let x = 0;
  let rotation = 0;
  let scale = 1;
  let tiltX = -1.2;
  let tiltY = 0;
  let opacity = 1;
  let z = 0;
  let stackOrder = 1;

  if (activeIndex < 0) {
    y = Math.min(stageHeight * (wideLayout ? 0.34 : 0.54), stageHeight - cardHeight - (wideLayout ? 108 : 132)) + index * Math.min(10, stageHeight * 0.0115);
    x = xOffsets[index];
    rotation = rotations[index];
    scale = 1 - index * 0.014;
    tiltX = -2.4 - index * 0.18;
    tiltY = xOffsets[index] * 0.16;
    z = 48 - index * 8;
    stackOrder = 50 - index;
  } else if (index < activeIndex) {
    y = -cardHeight + 94 + index * 9 - Math.max(0, activeIndex - index - 1) * 4;
    x = xOffsets[index] * 0.3;
    rotation = rotations[index] * 0.18;
    scale = 0.89 + index * 0.006;
    tiltX = -1.2;
    tiltY = 0;
    opacity = 0.5;
    z = 8 + index * 2;
    stackOrder = 20 + index;
  } else if (index === activeIndex) {
    y = focusY();
    z = 58;
    stackOrder = 70;
  } else {
    const distance = index - activeIndex - 1;
    y = stageHeight * (0.83 + distance * 0.42);
    x = xOffsets[index] * 0.35;
    rotation = rotations[index] * 0.45;
    scale = 0.97 - distance * 0.018;
    tiltX = -1.8;
    tiltY = xOffsets[index] * 0.08;
    opacity = Math.max(0.48, 0.74 - distance * 0.08);
    z = 36 - distance * 5;
    stackOrder = 48 - distance;
  }

  if (drag.active) {
    const boundary =
      (activeIndex < 0 && drag.offset > 0) ||
      (activeIndex === projects.length - 1 && drag.offset < 0);
    const dampedOffset = boundary ? drag.offset * 0.32 : drag.offset;
    if (activeIndex < 0) {
      y += dampedOffset * (1 - index * 0.025);
    } else if (index < activeIndex) {
      y += dampedOffset * 0.28;
    } else if (index === activeIndex) {
      y += dampedOffset;
    } else {
      y += dampedOffset * 0.76;
    }
  }

  return Object.assign(targets[index], { x, y, rotation, scale, tiltX, tiltY, opacity, z, stackOrder });
}

function springScalar(motion, key, target, dt, omega) {
  const velocityKey = `v${key}`;
  const value = motion[key];
  const velocity = motion[velocityKey];
  const f = 1 + 2 * dt * omega;
  const oo = omega * omega;
  const hoo = dt * oo;
  const hhoo = dt * hoo;
  const inverse = 1 / (f + hhoo);
  const nextValue = (f * value + dt * velocity + hhoo * target) * inverse;
  const nextVelocity = (velocity + hoo * (target - value)) * inverse;
  motion[key] = nextValue;
  motion[velocityKey] = nextVelocity;
  return Math.abs(nextValue - target) > 0.04 || Math.abs(nextVelocity) > 0.04;
}

function writeCardTransform(index, target) {
  const motion = motions[index];
  const card = cards[index];
  const mesh = meshes[index];
  const radians = THREE.MathUtils.degToRad;

  card.style.transform = `translate3d(calc(-50% + ${motion.x.toFixed(2)}px), ${motion.y.toFixed(2)}px, 0) rotateX(${motion.tiltX.toFixed(2)}deg) rotateY(${motion.tiltY.toFixed(2)}deg) rotateZ(${motion.rotation.toFixed(2)}deg) scale(${motion.scale.toFixed(4)})`;
  card.style.opacity = motion.opacity.toFixed(3);
  metrics.cardTopPositions[index] = Number(motion.y.toFixed(1));

  if (!mesh) return;
  mesh.position.set(
    cardCenterX - stageWidth / 2 + motion.x,
    stageHeight / 2 - (motion.y + cardHeight / 2),
    target.z,
  );
  mesh.rotation.set(radians(-motion.tiltX), radians(motion.tiltY), radians(-motion.rotation));
  mesh.scale.set(cardWidth * motion.scale, cardWidth * motion.scale, cardWidth * motion.scale);

}

function renderFrame() {
  if (!renderer || !metrics.webgl || detailOpen || document.hidden) return;
  const renderStartedAt = performance.now();
  renderer.render(threeScene, camera);
  const renderMs = performance.now() - renderStartedAt;
  metrics.renderSamples += 1;
  metrics.averageRenderMs = Number((
    (metrics.averageRenderMs * (metrics.renderSamples - 1) + renderMs) /
    metrics.renderSamples
  ).toFixed(3));
  metrics.maxRenderMs = Math.max(metrics.maxRenderMs, Number(renderMs.toFixed(3)));
  metrics.drawCalls = renderer.info.render.calls;
  metrics.triangles = renderer.info.render.triangles;
}

function settleImmediately() {
  projects.forEach((_, index) => {
    const target = cardTarget(index);
    const motion = motions[index];
    motion.x = target.x;
    motion.y = target.y;
    motion.rotation = target.rotation;
    motion.scale = target.scale;
    motion.tiltX = target.tiltX;
    motion.tiltY = target.tiltY;
    motion.opacity = target.opacity;
    motion.vx = 0;
    motion.vy = 0;
    motion.vrotation = 0;
    motion.vscale = 0;
    motion.vtiltX = 0;
    motion.vtiltY = 0;
    motion.vopacity = 0;
    writeCardTransform(index, target);
  });
  updateCopyRange();
  renderFrame();
}

function animationFrame(time) {
  rafId = 0;
  metrics.rafActive = true;
  const frameMs = previousFrameTime ? time - previousFrameTime : 16.67;
  previousFrameTime = time;
  if (frameMs > 0 && frameMs < 250) {
    metrics.frames += 1;
    frameTimeTotal += frameMs;
    metrics.averageFrameMs = Number((frameTimeTotal / metrics.frames).toFixed(2));
    metrics.maxFrameMs = Math.max(metrics.maxFrameMs, Number(frameMs.toFixed(2)));
  }
  const dt = Math.min(Math.max(frameMs / 1000, 1 / 240), 1 / 30);
  let moving = false;

  projects.forEach((_, index) => {
    const target = cardTarget(index);
    const motion = motions[index];
    if (reducedMotion.matches) {
      motion.x = target.x;
      motion.y = target.y;
      motion.rotation = target.rotation;
      motion.scale = target.scale;
      motion.tiltX = target.tiltX;
      motion.tiltY = target.tiltY;
      motion.opacity = target.opacity;
    } else {
      moving = springScalar(motion, "x", target.x, dt, 19) || moving;
      if (drag.active) {
        motion.y = target.y;
        motion.vy = 0;
      } else {
        moving = springScalar(motion, "y", target.y, dt, 18) || moving;
      }
      moving = springScalar(motion, "rotation", target.rotation, dt, 18) || moving;
      moving = springScalar(motion, "scale", target.scale, dt, 20) || moving;
      moving = springScalar(motion, "tiltX", target.tiltX, dt, 18) || moving;
      moving = springScalar(motion, "tiltY", target.tiltY, dt, 18) || moving;
      moving = springScalar(motion, "opacity", target.opacity, dt, 22) || moving;
    }
    writeCardTransform(index, target);
  });

  updateCopyRange();
  renderFrame();
  if (moving) {
    rafId = requestAnimationFrame(animationFrame);
  } else {
    settleImmediately();
    metrics.rafActive = false;
    metrics.lastAnimationMs = Math.max(0, Math.round(time - animationStartedAt));
    previousFrameTime = 0;
    stage.classList.remove("is-animating");
  }
}

function scheduleFrame() {
  if (document.hidden || detailOpen || rafId) return;
  animationStartedAt = performance.now();
  previousFrameTime = 0;
  metrics.rafActive = true;
  stage.classList.add("is-animating");
  rafId = requestAnimationFrame(animationFrame);
}

function resizeStage() {
  const nextWidth = Math.max(280, Math.round(stage.clientWidth));
  const nextHeight = Math.max(400, Math.round(stage.clientHeight));
  if (nextWidth === stageWidth && nextHeight === stageHeight && initialized) return;
  stageWidth = nextWidth;
  stageHeight = nextHeight;
  wideLayout = window.matchMedia('(min-width: 900px)').matches;
  cardWidth = wideLayout
    ? Math.min(stageWidth * 0.455, 560, (stageHeight - 180) / 0.95)
    : Math.min(stageWidth - (stageWidth <= 352 ? 36 : 48), 400, (stageHeight - 230) / 0.64);
  cardHeight = cardWidth * 0.64;
  cardCenterX = wideLayout ? stageWidth * 0.705 : stageWidth / 2;
  stage.style.setProperty('--card-width', `${cardWidth}px`);
  cards.forEach(card => {
    card.style.width = `${cardWidth}px`;
    card.style.height = `${cardHeight}px`;
    card.style.left = `${cardCenterX}px`;
  });

  if (renderer) {
    const pixelRatio = Math.max(1, Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(pixelBudget / (stageWidth * stageHeight))));
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(stageWidth, stageHeight, false);
    metrics.pixelRatio = Number(pixelRatio.toFixed(2));
    camera.left = -stageWidth / 2;
    camera.right = stageWidth / 2;
    camera.top = stageHeight / 2;
    camera.bottom = -stageHeight / 2;
    camera.updateProjectionMatrix();
  }

  updateCardStates();
  if (!initialized) {
    initialized = true;
    settleImmediately();
  } else {
    scheduleFrame();
  }
}

function fillActiveCopy(index) {
  const project = projects[index];
  if (!project) return;
  document.querySelector("#active-title").textContent = project.title;
  document.querySelector("#active-number").textContent = `PROJECT ${project.number} / ${String(projects.length).padStart(2, "0")}`;
  activeDescription.textContent = project.description;
  activeCategory.textContent = project.category;
  activeYear.textContent = project.year;
}

function setCopyState(visible, index = -1) {
  const nextVisible = Boolean(visible && index >= 0 && !detailOpen);
  const nextIndex = nextVisible ? index : -1;
  const changed = nextVisible !== copyState.visible || nextIndex !== copyState.index;
  if (!changed) return;
  if (nextVisible) fillActiveCopy(nextIndex);
  activeCopy.inert = !nextVisible;
  copyState.visible = nextVisible;
  copyState.index = nextIndex;
  activeCopy.classList.toggle("is-visible", nextVisible);
  activeCopy.setAttribute("aria-hidden", String(!nextVisible));
  stage.classList.toggle("has-copy-preview", nextVisible && activeIndex < 0);
  metrics.copyVisible = nextVisible;
  metrics.copyProjectIndex = nextIndex;
  if (changed) metrics.copyTransitions += 1;
}

function updateCopyRange() {
  const focusPosition = focusY();
  const enterRange = Math.max(56, Math.min(88, stageHeight * 0.105));
  const exitRange = enterRange + Math.max(20, Math.min(34, stageHeight * 0.04));
  metrics.copyEnterRange = Number(enterRange.toFixed(1));
  metrics.copyExitRange = Number(exitRange.toFixed(1));
  metrics.copyFocusY = Number(focusPosition.toFixed(1));

  if (detailOpen) {
    metrics.copyDistance = null;
    setCopyState(false);
    return;
  }

  const candidateIndexes = activeIndex >= 0
    ? [activeIndex]
    : projects.map((_, index) => index);
  let candidateIndex = -1;
  let candidateDistance = Number.POSITIVE_INFINITY;
  candidateIndexes.forEach((index) => {
    const distance = Math.abs(motions[index].y - focusPosition);
    if (distance < candidateDistance) {
      candidateDistance = distance;
      candidateIndex = index;
    }
  });

  if (candidateIndex >= 0) {
    const restingCopyY = focusPosition + cardHeight + 30;
    const followingCopyY = motions[candidateIndex].y + cardHeight + 30;
    const copyY = Math.min(stageHeight - 132, Math.max(restingCopyY, followingCopyY));
    activeCopy.style.setProperty("--copy-y", `${copyY.toFixed(1)}px`);
  }

  if (copyState.visible && candidateIndex === copyState.index && candidateDistance <= exitRange) {
    metrics.copyDistance = Number(candidateDistance.toFixed(1));
    return;
  }

  if (candidateIndex >= 0 && candidateDistance <= enterRange) {
    metrics.copyDistance = Number(candidateDistance.toFixed(1));
    setCopyState(true, candidateIndex);
    return;
  }

  metrics.copyDistance = Number.isFinite(candidateDistance)
    ? Number(candidateDistance.toFixed(1))
    : null;
  setCopyState(false);
}

function updateCardStates() {
  cards.forEach((card, index) => {
    const target = cardTarget(index);
    const isFace = index === activeIndex || (activeIndex < 0 && index === 0);
    card.style.zIndex = String(target.stackOrder);
    card.classList.toggle('is-active', index === activeIndex);
    card.classList.toggle('is-face', isFace);
    card.classList.toggle('is-muted', activeIndex >= 0 && index !== activeIndex);
    card.tabIndex = isFace ? 0 : -1;
    card.setAttribute('aria-label', `${index === activeIndex ? '查看' : '切换到'}项目：${projects[index].title}`);
    if (index === activeIndex) card.setAttribute('aria-current', 'true');
    else card.removeAttribute('aria-current');
    if (meshes[index]) {
      meshes[index].renderOrder = target.stackOrder;
      lineMeshes[index].renderOrder = target.stackOrder;
      const focused = activeIndex < 0 || index === activeIndex;
      materials[index].color.copy(toneColors[index]);
      if (!focused) materials[index].color.lerp(softGrayColor, metrics.mutedGrayBlend);
      lineMaterials[index].opacity = focused ? 1 : 0.58;
    }
  });
}

function updateCollectionUI() {
  updateCardStates();
  const hasActive = activeIndex >= 0;
  stage.classList.toggle("has-active", hasActive);
  stage.classList.toggle("is-deck", !detailOpen);
  intro.classList.toggle("is-away", hasActive);
  intro.inert = hasActive;
  gestureCue.classList.toggle("is-away", hasActive);
  stageFooter.classList.toggle("is-away", hasActive);
  projectCount.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`;
  previousProject.disabled = activeIndex < 0;
  nextProject.disabled = activeIndex >= projects.length - 1;

  if (hasActive) {
    const project = projects[activeIndex];
    fillActiveCopy(activeIndex);
    liveStatus.textContent = `当前项目：${project.title}，第 ${activeIndex + 1} 个，共 ${projects.length} 个。`;
  } else {
    liveStatus.textContent = "作品卡片位于初始堆叠状态。";
  }
}

function setActive(nextIndex, { announce = true } = {}) {
  const clamped = Math.max(-1, Math.min(projects.length - 1, nextIndex));
  drag.offset = 0;
  const preserveCopy = copyState.visible && copyState.index === clamped;
  if (!preserveCopy) setCopyState(false);
  if (clamped === activeIndex) {
    scheduleFrame();
    return;
  }
  activeIndex = clamped;
  updateCollectionUI();
  if (!announce) liveStatus.textContent = "";
  scheduleFrame();
}

function withViewTransition(update) { update(); }

function fillDetail(index) {
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];
  detailIndex = index;
  detailCount.textContent = `${project.number} / ${String(projects.length).padStart(2, "0")}`;
  detailHero.style.setProperty("--detail-tone", project.tone);
  detailHero.classList.toggle("is-dark-text", project.slug === "civic-signal");
  const isZhuozai = project.slug === "zhuozai-ai";
  detailView.classList.toggle("is-zhuozai", isZhuozai);
  detailHero.hidden = isZhuozai;
  document.querySelector(".detail-content").hidden = isZhuozai;
  const caseHost = document.querySelector("#zhuozai-case");
  caseHost.hidden = !isZhuozai;
  if (isZhuozai && !caseHost.hasChildNodes()) { caseHost.innerHTML = renderZhuozaiCase(); bindZhuozaiCase(caseHost); }
  detailMark.textContent = project.mark;
  detailKicker.textContent = `${project.category} · ${project.year}`;
  detailTitle.textContent = project.title;
  detailCnTitle.textContent = project.cnTitle;
  detailRole.textContent = project.role;
  detailDuration.textContent = project.duration;
  detailYear.textContent = project.year;
  detailDescription.textContent = project.description;
  detailChallenge.textContent = project.challenge;
  detailApproach.textContent = project.approach;
  detailOutcomes.replaceChildren(...project.outcomes.map((outcome, outcomeIndex) => {
    const row = document.createElement("div");
    const number = document.createElement("span");
    const text = document.createElement("strong");
    number.textContent = String(outcomeIndex + 1).padStart(2, "0");
    text.textContent = outcome;
    row.append(number, text);
    return row;
  }));
  nextDetailTitle.textContent = next.title;
  nextDetail.setAttribute("aria-label", `查看下一个项目：${next.title}`);
}

function showDetail(index, { fromHistory = false } = {}) {
  if (index < 0) return;
  withViewTransition(() => {
    fillDetail(index);
    detailOpen = true;
    cancelAnimationFrame(rafId);
    rafId = 0;
    metrics.rafActive = false;
    stage.classList.remove('is-animating');
    collection.inert = true;
    updateBackgroundMotion();
    detailView.hidden = false;
    detailView.scrollTop = 0;
    collection.classList.add("is-hidden");
    collection.setAttribute("aria-hidden", "true");
    stage.classList.add("is-detail");
    stage.classList.remove("is-deck");
    setCopyState(false);
  });
  if (!fromHistory && location.hash !== `#${projects[index].slug}`) {
    window.history.pushState({ myAssetsThreeDetail: true }, "", `#${projects[index].slug}`);
    ownsDetailHistory = true;
  }
  requestAnimationFrame(() => detailBack.focus({ preventScroll: true }));
}

function closeDetail({ fromHistory = false } = {}) {
  if (!detailOpen) return;
  if (!fromHistory && ownsDetailHistory) {
    ownsDetailHistory = false;
    window.history.back();
    return;
  }
  if (!fromHistory) {
    const url = new URL(location.href); url.hash = '';
    history.replaceState(null, '', url.href);
  }
  withViewTransition(() => {
    detailOpen = false;
    collection.inert = false;
    updateBackgroundMotion();
    detailIndex = -1;
    detailView.hidden = true;
    collection.classList.remove("is-hidden");
    collection.setAttribute("aria-hidden", "false");
    stage.classList.remove("is-detail");
    stage.classList.add("is-deck");
    scheduleFrame();
  });
  cards[Math.max(activeIndex, 0)].focus({ preventScroll: true });
}

function beginDrag(event) {
  if (detailOpen || (event.pointerType === "mouse" && event.button !== 0)) return;
  if (event.target.closest("button:not(.project-card), a")) return;
  drag.active = true;
  drag.pointerId = event.pointerId;
  drag.startY = event.clientY;
  drag.lastY = event.clientY;
  drag.lastTime = performance.now();
  drag.offset = 0;
  drag.velocity = 0;
  drag.moved = false;
  drag.captured = false;
  stage.classList.add("is-dragging");
  scheduleFrame();
}

function moveDrag(event) {
  if (!drag.active || event.pointerId !== drag.pointerId || detailOpen) return;
  event.preventDefault();
  const now = performance.now();
  const elapsed = Math.max(8, now - drag.lastTime);
  drag.offset = event.clientY - drag.startY;
  drag.velocity = (event.clientY - drag.lastY) / elapsed;
  drag.lastY = event.clientY;
  drag.lastTime = now;
  if (Math.abs(drag.offset) > 8) {
    drag.moved = true;
    if (!drag.captured) {
      stage.setPointerCapture?.(event.pointerId);
      drag.captured = true;
    }
  }
  scheduleFrame();
}

function finishDrag(event, cancelled = false) {
  if (!drag.active || (event && event.pointerId !== drag.pointerId)) return;
  const offset = drag.offset;
  const velocity = drag.velocity;
  const moved = drag.moved;
  drag.active = false;
  if (drag.captured && event && stage.hasPointerCapture?.(event.pointerId)) {
    stage.releasePointerCapture(event.pointerId);
  }
  drag.pointerId = null;
  drag.captured = false;
  stage.classList.remove("is-dragging");
  suppressClick = moved;
  const goNext = offset < -48 || velocity < -0.48;
  const goPrevious = offset > 48 || velocity > 0.48;
  if (!cancelled && goNext) setActive(activeIndex + 1);
  else if (!cancelled && goPrevious) setActive(activeIndex - 1);
  else {
    drag.offset = 0;
    scheduleFrame();
  }
  window.setTimeout(() => { suppressClick = false; }, 80);
}

function handleWheel(event) {
  if (detailOpen) return;
  event.preventDefault();
  if (wheelLocked) return;
  wheelAccumulator += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stageHeight : 1);
  if (Math.abs(wheelAccumulator) < 32) return;
  const direction = wheelAccumulator > 0 ? 1 : -1;
  wheelAccumulator = 0;
  wheelLocked = true;
  setActive(activeIndex + direction);
  window.setTimeout(() => { wheelLocked = false; }, 480);
}

function handleKey(event) {
  if (detailOpen) return;
  if (event.key === "ArrowDown" || event.key === "PageDown") {
    event.preventDefault();
    setActive(activeIndex + 1);
  } else if (event.key === "ArrowUp" || event.key === "PageUp") {
    event.preventDefault();
    setActive(activeIndex - 1);
  } else if (event.key === "Enter" && document.activeElement === stage && activeIndex >= 0) {
    event.preventDefault();
    showDetail(activeIndex);
  }
}

cards.forEach((card, index) => {
  card.addEventListener("click", () => {
    if (suppressClick) return;
    if (activeIndex === index) showDetail(index);
    else setActive(index);
  });
});

previousProject.addEventListener("click", (event) => {
  event.stopPropagation();
  setActive(activeIndex - 1);
});
nextProject.addEventListener("click", (event) => {
  event.stopPropagation();
  setActive(activeIndex + 1);
});

detailBack.addEventListener("click", () => closeDetail());
document.querySelector("#zhuozai-case").addEventListener("click", (event) => {
  if (event.target.closest("[data-case-next]")) {
    nextDetail.click();
    return;
  }
  const button = event.target.closest("[data-case-jump]");
  if (!button) return;
  const target = document.getElementById(button.dataset.caseJump);
  target?.scrollIntoView({ block: "start", behavior: reducedMotion.matches ? "auto" : "smooth" });
});
nextDetail.addEventListener("click", () => {
  const nextIndex = (detailIndex + 1) % projects.length;
  activeIndex = nextIndex;
  updateCollectionUI();
  withViewTransition(() => {
    fillDetail(nextIndex);
    detailView.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
  });
  window.history.replaceState({ myAssetsThreeDetail: true }, "", `#${projects[nextIndex].slug}`);
});

stage.addEventListener("pointerdown", beginDrag);
stage.addEventListener("pointermove", moveDrag, { passive: false });
stage.addEventListener("pointerup", finishDrag);
stage.addEventListener("pointercancel", event => finishDrag(event, true));
stage.addEventListener("lostpointercapture", event => { if (drag.active && event.target === stage) finishDrag(event, true); });
stage.addEventListener("wheel", handleWheel, { passive: false });
stage.addEventListener("keydown", handleKey);

function syncLocation() {
  const index = projects.findIndex(project => `#${project.slug}` === location.hash);
  if (index >= 0) {
    if (detailOpen && detailIndex === index) return;
    ownsDetailHistory = false;
    activeIndex = index;
    updateCollectionUI();
    showDetail(index, { fromHistory: true });
  } else closeDetail({ fromHistory: true });
}
window.addEventListener('popstate', syncLocation);
window.addEventListener('hashchange', syncLocation);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && detailOpen) closeDetail();
});
const motionToggle = document.querySelector('#motion-toggle');
function updateBackgroundMotion() {
  const paused = backgroundPaused || reducedMotion.matches || document.hidden || detailOpen;
  stage.classList.toggle('motion-paused', paused);
  motionToggle.setAttribute('aria-pressed', String(backgroundPaused || reducedMotion.matches));
  motionToggle.textContent = reducedMotion.matches ? '动态已减弱' : backgroundPaused ? '播放动态' : '暂停动态';
  motionToggle.disabled = reducedMotion.matches;
}
motionToggle.addEventListener('click', () => { backgroundPaused = !backgroundPaused; updateBackgroundMotion(); });
document.querySelector('#explore-projects').addEventListener('click', () => setActive(0));
document.querySelector('#open-active').addEventListener('click', () => showDetail(activeIndex));
updateBackgroundMotion();
document.addEventListener("visibilitychange", () => {
  updateBackgroundMotion();
  if (document.hidden && drag.active) finishDrag(null, true);
  if (document.hidden && rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
    metrics.rafActive = false;
    stage.classList.remove("is-animating");
  } else if (!document.hidden) {
    scheduleFrame();
  }
});

reducedMotion.addEventListener?.("change", () => {
  updateBackgroundMotion();
  settleImmediately();
});

initThree();
updateTypeScale();
resizeStage();
updateCollectionUI();
new ResizeObserver(resizeStage).observe(stage);
window.addEventListener("resize", updateTypeScale, { passive: true });

if (window.location.hash) {
  const index = projects.findIndex((project) => `#${project.slug}` === window.location.hash);
  if (index >= 0) {
    activeIndex = index;
    updateCollectionUI();
    settleImmediately();
    window.history.replaceState({ myAssetsThreeDetail: true }, "", window.location.hash);
    showDetail(index, { fromHistory: true });
  }
}

revealPrototype();
