/* Exploded shipping container — Three.js scene driven by scroll, with projected HTML labels */
import * as THREE from 'three';
import { gsap, ScrollTrigger, isTouch } from './core.js';

const L = 9.2, H = 3.7, W = 3.5, T = 0.1;

function corrugationTexture(repeatX) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const ctx = c.getContext('2d');
  for (let x = 0; x < 256; x++) {
    const v = 0.5 + 0.5 * Math.sin((x / 256) * Math.PI * 2 * 6);
    const g = Math.round(90 + v * 130);
    ctx.fillStyle = `rgb(${g},${g},${g})`;
    ctx.fillRect(x, 0, 1, 64);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, 1);
  return tex;
}

function shadowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
  grad.addColorStop(0, 'rgba(0,0,0,0.55)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const window01 = (p, a, b) => gsap.utils.clamp(0, 1, (p - a) / (b - a));

export function initExplodeScene({ canvas, stage, section, labels, items, progressBar }) {
  if (!canvas || !stage) return null;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (err) {
    console.warn('WebGL unavailable — container scene disabled', err);
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isTouch ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = false;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 3.6, 19.5);
  camera.lookAt(0, -0.3, 0);

  /* lights — cream key, rose fill, teal ambient */
  scene.add(new THREE.HemisphereLight(0xfaf3ec, 0x123f40, 1.9));
  const key = new THREE.DirectionalLight(0xfff4ea, 3.2);
  key.position.set(7, 12, 9);
  scene.add(key);
  const fill = new THREE.PointLight(0xe8a6b2, 120, 60, 1.7);
  fill.position.set(-10, 4, 10);
  scene.add(fill);
  const back = new THREE.PointLight(0x6aa9a9, 60, 50, 1.6);
  back.position.set(5, -2, -10);
  scene.add(back);
  const under = new THREE.PointLight(0xe8a6b2, 30, 30, 1.8);
  under.position.set(2, -6, 6);
  scene.add(under);

  const rig = new THREE.Group();
  scene.add(rig);

  /* materials */
  const shellMat = new THREE.MeshStandardMaterial({ color: 0x2f7c7e, metalness: 0.35, roughness: 0.48, bumpMap: corrugationTexture(14), bumpScale: 0.4 });
  const endMat = new THREE.MeshStandardMaterial({ color: 0x2f7c7e, metalness: 0.35, roughness: 0.48, bumpMap: corrugationTexture(5), bumpScale: 0.4 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x286e70, metalness: 0.35, roughness: 0.5, bumpMap: corrugationTexture(14), bumpScale: 0.3 });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x134546, metalness: 0.6, roughness: 0.35 });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xb9a892, metalness: 0.05, roughness: 0.9 });
  const cargoA = new THREE.MeshStandardMaterial({ color: 0xe8a6b2, roughness: 0.75 });
  const cargoB = new THREE.MeshStandardMaterial({ color: 0xf0c2ca, roughness: 0.75 });
  const cargoC = new THREE.MeshStandardMaterial({ color: 0xd98a98, roughness: 0.7 });
  const unitMat = new THREE.MeshStandardMaterial({ color: 0x0a2c2d, metalness: 0.6, roughness: 0.3 });
  const beaconMat = new THREE.MeshStandardMaterial({ color: 0xe8a6b2, emissive: 0xe8a6b2, emissiveIntensity: 2 });
  const edgeMat = new THREE.LineBasicMaterial({ color: 0xf0c2ca, transparent: true, opacity: 0.55 });

  const parts = [];
  function part(mesh, base, dir, dist, from, to, withEdges = true) {
    const group = new THREE.Group();
    group.position.copy(base);
    group.add(mesh);
    if (withEdges) mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), edgeMat));
    rig.add(group);
    const rec = { group, mesh, base: base.clone(), dir: dir.clone().normalize(), dist, from, to, local: 0 };
    parts.push(rec);
    return rec;
  }
  const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);

  /* --- roof + telemetry unit --- */
  const roof = part(box(L, T, W, roofMat), new THREE.Vector3(0, H / 2, 0), new THREE.Vector3(0, 1, 0), 2.4, 0.04, 0.4);
  const unit = box(0.7, 0.22, 0.5, unitMat);
  unit.position.set(L * 0.28, T / 2 + 0.11, 0);
  roof.group.add(unit);
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), beaconMat);
  beacon.position.set(L * 0.28 + 0.2, T / 2 + 0.28, 0);
  roof.group.add(beacon);
  const beaconGlow = new THREE.PointLight(0xe8a6b2, 0, 4, 2);
  beaconGlow.position.copy(beacon.position);
  roof.group.add(beaconGlow);

  /* --- walls --- */
  const wallBack = part(box(L, H, T, shellMat), new THREE.Vector3(0, 0, -W / 2), new THREE.Vector3(0, 0.4, -1), 2.1, 0.22, 0.6);
  const wallFront = part(box(L, H, T, shellMat), new THREE.Vector3(0, 0, W / 2), new THREE.Vector3(0, -0.62, 1), 3.6, 0.22, 0.62);
  const endWall = part(box(T, H, W, endMat), new THREE.Vector3(-L / 2, 0, 0), new THREE.Vector3(-1, 0.15, 0), 2.2, 0.24, 0.62);

  /* --- floor --- */
  const floor = part(box(L, T, W, floorMat), new THREE.Vector3(0, -H / 2, 0), new THREE.Vector3(0, -1, 0), 1.4, 0.3, 0.7);

  /* --- doors (hinged) --- */
  function door(side) {
    const pivot = new THREE.Group();
    pivot.position.set(L / 2, 0, side * (W / 2));
    const leaf = box(T, H - 0.05, W / 2 - 0.04, endMat);
    leaf.position.set(0, 0, -side * (W / 4));
    leaf.add(new THREE.LineSegments(new THREE.EdgesGeometry(leaf.geometry), edgeMat));
    // lock bars
    for (let i = 0; i < 2; i++) {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, H - 0.4, 12), frameMat);
      bar.position.set(T / 2 + 0.06, 0, -side * (W / 4) + (i === 0 ? -0.35 : 0.35));
      leaf.add(bar);
    }
    pivot.add(leaf);
    rig.add(pivot);
    return { pivot, leaf };
  }
  const doorL = door(-1);
  const doorR = door(1);

  /* --- frame: corner posts and rails (stay put) --- */
  const postGeo = new THREE.BoxGeometry(0.18, H + 0.02, 0.18);
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz]) => {
    const post = new THREE.Mesh(postGeo, frameMat);
    post.position.set(sx * (L / 2), 0, sz * (W / 2));
    rig.add(post);
  });
  const railGeo = new THREE.BoxGeometry(L + 0.18, 0.14, 0.14);
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sy, sz]) => {
    const rail = new THREE.Mesh(railGeo, frameMat);
    rail.position.set(0, sy * (H / 2), sz * (W / 2));
    rig.add(rail);
  });
  const crossGeo = new THREE.BoxGeometry(0.14, 0.14, W + 0.18);
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sy]) => {
    const rail = new THREE.Mesh(crossGeo, frameMat);
    rail.position.set(sx * (L / 2), sy * (H / 2), 0);
    rig.add(rail);
  });

  /* --- cargo: pallets of bagged grain + crates --- */
  const cargo = new THREE.Group();
  cargo.position.set(0, -H / 2 + T / 2, 0);
  rig.add(cargo);
  const palletMat = new THREE.MeshStandardMaterial({ color: 0x8d7a64, roughness: 0.9 });
  const positions = [-3.3, -1.1, 1.1, 3.3];
  positions.forEach((x, i) => {
    const pallet = box(1.9, 0.14, 2.4, palletMat);
    pallet.position.set(x, 0.07, 0);
    cargo.add(pallet);
    const h = 1.2 + (i % 2) * 0.5;
    const crate = box(1.7, h, 2.1, [cargoA, cargoB, cargoC, cargoB][i]);
    crate.position.set(x, 0.14 + h / 2, 0);
    crate.add(new THREE.LineSegments(new THREE.EdgesGeometry(crate.geometry), new THREE.LineBasicMaterial({ color: 0x0a2c2d, transparent: true, opacity: 0.25 })));
    cargo.add(crate);
    if (i % 2 === 0) {
      const top = box(1.3, 0.5, 1.5, cargoC);
      top.position.set(x, 0.14 + h + 0.25, 0);
      cargo.add(top);
    }
  });

  /* --- ground shadow --- */
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(L * 1.7, W * 2.6), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false, opacity: 0.9 }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -H / 2 - 2.2;
  rig.add(shadow);

  /* --- label anchors (local to rig) --- */
  const anchors = [
    { obj: roof.group, offset: new THREE.Vector3(L * 0.28, 0.5, 0) },
    { obj: wallFront.group, offset: new THREE.Vector3(-L * 0.22, 0.6, 0.2) },
    { obj: cargo, offset: new THREE.Vector3(0, 1.8, 0.3) },
    { obj: doorR.pivot, offset: new THREE.Vector3(0.3, 0.9, -W / 4) },
  ];
  const labelEls = labels ? [...labels.querySelectorAll('.explode__label')] : [];
  const itemEls = items ? [...items.querySelectorAll('.explode__item')] : [];
  const labelWindows = [[0.18, 0.26], [0.36, 0.44], [0.52, 0.6], [0.74, 0.82]];
  const itemThresholds = [0, 0.33, 0.55, 0.74];

  /* --- sizing --- */
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // pull the camera back on narrow stages so the exploded container stays framed
    camera.position.z = 19.5 + Math.max(0, 1.25 - camera.aspect) * 10;
    camera.updateProjectionMatrix();
    rig.scale.setScalar(w < 640 ? 0.72 : 0.92);
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(stage);

  /* --- scroll progress --- */
  const state = { target: 0, p: 0 };
  const clock = new THREE.Clock();
  let active = false;
  let activeItem = -1;
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => { state.target = self.progress; },
  });
  // render only while the section is anywhere near the viewport
  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => { active = self.isActive; if (active) clock.getDelta(); },
  });

  const v = new THREE.Vector3();
  function projectLabels(w, h) {
    labelEls.forEach((el, i) => {
      const a = anchors[i];
      if (!a) return;
      v.copy(a.offset);
      a.obj.localToWorld(v);
      v.project(camera);
      const x = (v.x * 0.5 + 0.5) * w;
      const y = (-v.y * 0.5 + 0.5) * h;
      const left = x > w * 0.55;
      el.classList.toggle('explode__label--left', left);
      const lw = el.offsetWidth, lh = el.offsetHeight;
      // keep labels inside the stage so nothing is clipped on narrow screens
      const lx = gsap.utils.clamp(0, Math.max(0, w - lw), left ? x - lw : x);
      const ly = gsap.utils.clamp(0, Math.max(0, h - lh), y - lh / 2);
      el.style.transform = `translate3d(${lx}px, ${ly}px, 0)`;
    });
  }

  function tick() {
    if (!active) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    state.p += (state.target - state.p) * Math.min(1, dt * 7);
    const p = state.p;

    parts.forEach((rec) => {
      const local = easeOut(window01(p, rec.from, rec.to));
      rec.local = local;
      rec.group.position.copy(rec.base).addScaledVector(rec.dir, rec.dist * local);
    });
    // doors: slide out then swing open
    const doorP = easeOut(window01(p, 0.62, 0.95));
    doorL.pivot.position.x = L / 2 + doorP * 1.25;
    doorR.pivot.position.x = L / 2 + doorP * 1.25;
    doorL.pivot.rotation.y = doorP * 1.25;
    doorR.pivot.rotation.y = -doorP * 1.25;
    // cargo lifts slightly to read as "revealed"
    const cargoP = easeOut(window01(p, 0.42, 0.72));
    cargo.position.y = -H / 2 + T / 2 + cargoP * 0.35;

    rig.rotation.y = -0.58 + p * 0.72 + Math.sin(t * 0.35) * 0.03;
    rig.rotation.x = 0.2 - p * 0.03;
    rig.position.y = -0.2 + Math.sin(t * 0.8) * 0.06;
    beaconMat.emissiveIntensity = 1.2 + Math.sin(t * 4) * 1.1;
    beaconGlow.intensity = (1 + Math.sin(t * 4)) * 4 * roof.local;
    shadow.material.opacity = 0.9 - p * 0.35;
    shadow.scale.setScalar(1 + p * 0.25);

    // labels & list state
    labelEls.forEach((el, i) => {
      const [a, b] = labelWindows[i];
      el.classList.toggle('is-on', p > a && p < 0.995);
      el.style.opacity = p > a ? String(Math.min(1, (p - a) / (b - a))) : '0';
    });
    let idx = 0;
    itemThresholds.forEach((th, i) => { if (p >= th) idx = i; });
    if (idx !== activeItem) {
      activeItem = idx;
      itemEls.forEach((el, i) => el.classList.toggle('is-active', i === idx));
    }
    if (progressBar) progressBar.style.transform = `scaleX(${p})`;

    renderer.render(scene, camera);
    projectLabels(stage.clientWidth, stage.clientHeight);
  }
  gsap.ticker.add(tick);

  return {
    /* debug/testing: force a progress value and keep rendering */
    setProgress(p) { state.target = p; state.p = p; active = true; },
    destroy() { gsap.ticker.remove(tick); ro.disconnect(); renderer.dispose(); },
  };
}
