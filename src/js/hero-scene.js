/* Hero — Three.js "nexus" globe: point-cloud sphere, graticule, pulsing route arcs, ambient dust */
import * as THREE from 'three';
import { gsap, ScrollTrigger, isTouch, isDesktop, reducedMotion } from './core.js';

// Custom shaders write colors straight to the framebuffer, so keep them in sRGB values.
const srgb = (hex) => new THREE.Color(hex).convertLinearToSRGB();
const COLORS = {
  cream: srgb('#f7f1ea'),
  rose: srgb('#e8a6b2'),
  roseDeep: srgb('#d98a98'),
  teal: srgb('#6aa9a9'),
  tealDeep: srgb('#0c3536'),
};

const pointVertex = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 nView = normalize(normalMatrix * normalize(position));
    float facing = smoothstep(-0.25, 0.45, nView.z);
    float twinkle = 0.7 + 0.3 * sin(uTime * 1.4 + aSeed * 6.2831);
    vAlpha = twinkle * facing * uOpacity;
    gl_PointSize = aSize * uPixelRatio * (30.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;
const pointFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.12, d);
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`;
const arcVertex = /* glsl */ `
  attribute float aT;
  attribute float aOffset;
  varying float vT;
  varying float vOff;
  void main() {
    vT = aT; vOff = aOffset;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const arcFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vT;
  varying float vOff;
  void main() {
    float head = fract(uTime * 0.16 + vOff);
    float d = head - vT;
    float trail = smoothstep(0.32, 0.0, d) * step(0.0, d);
    float base = 0.10 * (1.0 - abs(vT - 0.5) * 1.2);
    float a = base + trail * 0.95;
    vec3 col = mix(uColorA, uColorB, clamp(trail * 1.4, 0.0, 1.0));
    gl_FragColor = vec4(col, a * uOpacity);
  }
`;
const rimVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const rimFragment = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uRim;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 3.2);
    vec3 col = mix(uBase, uRim, fres * 0.9);
    gl_FragColor = vec4(col, uOpacity);
  }
`;

function fibonacciSphere(n, radius) {
  const pts = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = phi * i;
    pts.push(new THREE.Vector3(Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius));
  }
  return pts;
}

function makePoints(positions, colors, sizes, seeds, material) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  return new THREE.Points(geo, material);
}

export function initHeroScene(canvas) {
  if (!canvas) return null;
  const hero = canvas.closest('.hero');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (err) {
    console.warn('WebGL unavailable — hero scene disabled', err);
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isTouch ? 1.5 : 1.8));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0, 10.5);

  const world = new THREE.Group();
  const globe = new THREE.Group();
  world.add(globe);
  scene.add(world);

  const R = 2.75;
  const uniforms = {
    uTime: { value: 0 },
    uPixelRatio: { value: renderer.getPixelRatio() },
    uOpacity: { value: 0 },
  };

  /* --- occluder sphere with fresnel rim --- */
  const rimMat = new THREE.ShaderMaterial({
    vertexShader: rimVertex,
    fragmentShader: rimFragment,
    uniforms: { uBase: { value: COLORS.tealDeep }, uRim: { value: COLORS.rose }, uOpacity: { value: 0 } },
    transparent: true,
  });
  globe.add(new THREE.Mesh(new THREE.SphereGeometry(R * 0.965, 64, 64), rimMat));

  /* --- shared point material --- */
  const pMat = new THREE.ShaderMaterial({
    vertexShader: pointVertex,
    fragmentShader: pointFragment,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  /* --- point cloud --- */
  const N = isTouch ? 1500 : 3400;
  const pts = fibonacciSphere(N, R);
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), size = new Float32Array(N), seed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos.set([pts[i].x, pts[i].y, pts[i].z], i * 3);
    const r = Math.random();
    const c = r < 0.14 ? COLORS.rose : r < 0.3 ? COLORS.teal : COLORS.cream;
    col.set([c.r, c.g, c.b], i * 3);
    size[i] = 0.55 + Math.pow(Math.random(), 2.2) * 1.9;
    seed[i] = Math.random();
  }
  globe.add(makePoints(pos, col, size, seed, pMat));

  /* --- graticule --- */
  const gratVerts = [];
  const seg = 96;
  for (let lon = 0; lon < 12; lon++) {
    const a = (lon / 12) * Math.PI;
    for (let i = 0; i < seg; i++) {
      const t0 = (i / seg) * Math.PI * 2, t1 = ((i + 1) / seg) * Math.PI * 2;
      gratVerts.push(Math.cos(t0) * Math.cos(a) * R, Math.sin(t0) * R, Math.cos(t0) * Math.sin(a) * R);
      gratVerts.push(Math.cos(t1) * Math.cos(a) * R, Math.sin(t1) * R, Math.cos(t1) * Math.sin(a) * R);
    }
  }
  for (let lat = 1; lat < 8; lat++) {
    const y = Math.cos((lat / 8) * Math.PI) * R;
    const rr = Math.sqrt(R * R - y * y);
    for (let i = 0; i < seg; i++) {
      const t0 = (i / seg) * Math.PI * 2, t1 = ((i + 1) / seg) * Math.PI * 2;
      gratVerts.push(Math.cos(t0) * rr, y, Math.sin(t0) * rr, Math.cos(t1) * rr, y, Math.sin(t1) * rr);
    }
  }
  const gGeo = new THREE.BufferGeometry();
  gGeo.setAttribute('position', new THREE.Float32BufferAttribute(gratVerts, 3));
  const gMat = new THREE.LineBasicMaterial({ color: COLORS.teal, transparent: true, opacity: 0 });
  globe.add(new THREE.LineSegments(gGeo, gMat));

  /* --- route arcs between hubs --- */
  const hubs = fibonacciSphere(140, R * 1.005);
  const arcCount = isTouch ? 16 : 30;
  const arcVerts = [], arcT = [], arcOff = [];
  let made = 0, guard = 0;
  while (made < arcCount && guard++ < 3000) {
    const a = hubs[Math.floor(Math.random() * hubs.length)];
    const b = hubs[Math.floor(Math.random() * hubs.length)];
    const ang = a.angleTo(b);
    if (ang < 0.45 || ang > 2.3) continue;
    const mid = a.clone().add(b).normalize().multiplyScalar(R * (1.08 + (ang / Math.PI) * 0.75));
    const p = new THREE.QuadraticBezierCurve3(a, mid, b).getPoints(56);
    const off = Math.random();
    for (let i = 0; i < p.length - 1; i++) {
      arcVerts.push(p[i].x, p[i].y, p[i].z, p[i + 1].x, p[i + 1].y, p[i + 1].z);
      arcT.push(i / (p.length - 1), (i + 1) / (p.length - 1));
      arcOff.push(off, off);
    }
    made++;
  }
  const aGeo = new THREE.BufferGeometry();
  aGeo.setAttribute('position', new THREE.Float32BufferAttribute(arcVerts, 3));
  aGeo.setAttribute('aT', new THREE.Float32BufferAttribute(arcT, 1));
  aGeo.setAttribute('aOffset', new THREE.Float32BufferAttribute(arcOff, 1));
  const aMat = new THREE.ShaderMaterial({
    vertexShader: arcVertex,
    fragmentShader: arcFragment,
    uniforms: { uTime: uniforms.uTime, uOpacity: uniforms.uOpacity, uColorA: { value: COLORS.roseDeep }, uColorB: { value: COLORS.cream } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  globe.add(new THREE.LineSegments(aGeo, aMat));

  /* --- hub beacons --- */
  const H = hubs.length;
  const bPos = new Float32Array(H * 3), bCol = new Float32Array(H * 3), bSize = new Float32Array(H), bSeed = new Float32Array(H);
  hubs.forEach((h, i) => {
    bPos.set([h.x, h.y, h.z], i * 3);
    bCol.set([COLORS.rose.r, COLORS.rose.g, COLORS.rose.b], i * 3);
    bSize[i] = 2.4 + Math.random() * 1.2;
    bSeed[i] = Math.random();
  });
  globe.add(makePoints(bPos, bCol, bSize, bSeed, pMat));

  /* --- ambient dust --- */
  const D = isTouch ? 160 : 420;
  const dPos = new Float32Array(D * 3), dCol = new Float32Array(D * 3), dSize = new Float32Array(D), dSeed = new Float32Array(D);
  for (let i = 0; i < D; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(R * (1.4 + Math.random() * 1.6));
    dPos.set([v.x, v.y, v.z], i * 3);
    const c = Math.random() < 0.5 ? COLORS.rose : COLORS.cream;
    dCol.set([c.r, c.g, c.b], i * 3);
    dSize[i] = 0.4 + Math.random() * 1.1;
    dSeed[i] = Math.random();
  }
  const dust = makePoints(dPos, dCol, dSize, dSeed, pMat);
  world.add(dust);

  /* --- layout / resize --- */
  let layoutScale = 1;
  function layout() {
    const w = hero.clientWidth, h = hero.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    const aspect = w / h;
    camera.aspect = aspect;
    camera.position.z = (isDesktop() ? 11.4 : 10.5) + Math.max(0, 1.35 - aspect) * 5.5;
    camera.updateProjectionMatrix();
    if (isDesktop()) {
      world.position.set(aspect > 1.6 ? 3.2 : 2.8, 0.3, 0);
      layoutScale = 1;
    } else if (w > 640) {
      world.position.set(2.0, 1.4, 0);
      layoutScale = 0.85;
    } else {
      world.position.set(0.6, 2.6, 0);
      layoutScale = 0.72;
    }
  }
  layout();
  const ro = new ResizeObserver(layout);
  ro.observe(hero);

  /* --- interaction --- */
  const mouse = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  if (!isTouch) {
    window.addEventListener('mousemove', (e) => {
      target.x = e.clientX / window.innerWidth - 0.5;
      target.y = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });
  }

  /* --- scroll: parallax & fade; pause rendering when hero is off-screen --- */
  let active = true;
  const scrollState = { p: 0 };
  ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: 'bottom top',
    onUpdate: (self) => { scrollState.p = self.progress; },
    onToggle: (self) => { active = self.isActive; },
  });

  /* --- render loop --- */
  const state = { spin: 0, introRot: -1.2, introScale: 0.6, introOpacity: 0 };
  const clock = new THREE.Clock();
  function tick() {
    if (!active) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    uniforms.uTime.value = t;
    mouse.x += (target.x - mouse.x) * 0.045;
    mouse.y += (target.y - mouse.y) * 0.045;
    state.spin += dt * (reducedMotion ? 0.02 : 0.11);
    globe.rotation.y = state.spin + state.introRot;
    globe.scale.setScalar(layoutScale * state.introScale);
    world.rotation.x = mouse.y * 0.32 + scrollState.p * 0.35;
    world.rotation.y = mouse.x * 0.5;
    dust.rotation.y = -t * 0.02;
    dust.rotation.z = t * 0.01;
    const opacity = state.introOpacity * (1 - scrollState.p * 0.9);
    uniforms.uOpacity.value = opacity;
    gMat.opacity = 0.16 * opacity;
    rimMat.uniforms.uOpacity.value = opacity;
    globe.position.y = scrollState.p * 1.8 + Math.sin(t * 0.6) * 0.05;
    renderer.render(scene, camera);
  }
  gsap.ticker.add(tick);

  return {
    intro() {
      gsap.to(state, { introScale: 1, duration: 2.6, ease: 'nexus' });
      gsap.to(state, { introRot: 0, duration: 3, ease: 'nexus' });
      gsap.to(state, { introOpacity: 1, duration: 2.2, ease: 'power2.out', delay: 0.15 });
    },
    destroy() { gsap.ticker.remove(tick); ro.disconnect(); renderer.dispose(); },
  };
}
