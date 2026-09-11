/* 3D cylindrical testimonial slider — drag with inertia, arrows, dots, autoplay */
import { gsap, Draggable, ScrollTrigger } from './core.js';

export function initSlider3D() {
  const root = document.getElementById('slider3d');
  const track = document.getElementById('slider3d-track');
  if (!root || !track) return;
  const stage = root.querySelector('.slider3d__stage');
  const cards = [...track.children];
  const n = cards.length;
  const step = 360 / n;
  const dotsWrap = document.getElementById('slider3d-dots');
  const prevBtn = document.getElementById('slider3d-prev');
  const nextBtn = document.getElementById('slider3d-next');

  const state = { rotation: 0 };
  let radius = 0;

  /* dots */
  const dots = cards.map((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    b.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(b);
    return b;
  });

  function layout() {
    const w = cards[0].offsetWidth;
    radius = Math.round(w / 2 / Math.tan(Math.PI / n) + (w > 380 ? 90 : 40));
    cards.forEach((c, i) => {
      c.style.transform = `rotateY(${i * step}deg) translateZ(${radius}px)`;
    });
    render();
  }

  function render() {
    gsap.set(track, { rotationY: state.rotation, z: -radius });
    let frontIdx = 0, best = Infinity;
    cards.forEach((c, i) => {
      let a = ((i * step + state.rotation) % 360 + 360) % 360;
      if (a > 180) a -= 360;
      const d = Math.abs(a) / 180;
      c.style.opacity = String(1 - Math.pow(d, 0.75) * 0.92);
      c.style.zIndex = String(Math.round((1 - d) * 100));
      const isFront = Math.abs(a) < step / 2;
      c.classList.toggle('is-front', isFront);
      if (Math.abs(a) < best) { best = Math.abs(a); frontIdx = i; }
    });
    dots.forEach((d, i) => d.classList.toggle('is-active', i === frontIdx));
  }

  function animateTo(rotation, duration = 1.1) {
    gsap.to(state, { rotation, duration, ease: 'nexus', onUpdate: render, overwrite: true });
  }
  function nearestIndex() {
    return ((Math.round(-state.rotation / step) % n) + n) % n;
  }
  function goTo(i) {
    // shortest path from current rotation to card i
    const current = -state.rotation / step;
    let delta = i - (((current % n) + n) % n);
    if (delta > n / 2) delta -= n;
    if (delta < -n / 2) delta += n;
    animateTo(state.rotation - delta * step);
    restartAuto();
  }
  const next = () => { animateTo(Math.round((state.rotation - step) / step) * step); restartAuto(); };
  const prev = () => { animateTo(Math.round((state.rotation + step) / step) * step); restartAuto(); };
  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);

  /* drag on a proxy element, mapped to rotation */
  const proxy = document.createElement('div');
  const degPerPx = 0.22;
  let startRot = 0, startX = 0;
  Draggable.create(proxy, {
    type: 'x',
    trigger: stage,
    inertia: true,
    onPress() {
      gsap.killTweensOf(state);
      startRot = state.rotation;
      startX = this.x;
      stopAuto();
      root.classList.add('is-dragging');
    },
    onDrag() { state.rotation = startRot + (this.x - startX) * degPerPx; render(); },
    onThrowUpdate() { state.rotation = startRot + (this.x - startX) * degPerPx; render(); },
    snap: {
      x: (x) => {
        const rot = startRot + (x - startX) * degPerPx;
        const snapped = Math.round(rot / step) * step;
        return startX + (snapped - startRot) / degPerPx;
      },
    },
    onRelease() { root.classList.remove('is-dragging'); },
    onThrowComplete() { restartAuto(); },
    maxDuration: 1.4,
    throwResistance: 2500,
  });

  /* autoplay */
  let timer = null;
  let hovered = false;
  function startAuto() { stopAuto(); timer = setInterval(() => { if (!hovered) animateTo(state.rotation - step, 1.4); }, 4200); }
  function stopAuto() { if (timer) clearInterval(timer); timer = null; }
  function restartAuto() { startAuto(); }
  root.addEventListener('mouseenter', () => { hovered = true; });
  root.addEventListener('mouseleave', () => { hovered = false; });

  /* keyboard */
  root.tabIndex = 0;
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });

  layout();
  window.addEventListener('resize', layout);
  ScrollTrigger.create({
    trigger: root,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => (self.isActive ? startAuto() : stopAuto()),
  });

  // entrance
  gsap.from(stage, { opacity: 0, y: 60, duration: 1.4, ease: 'nexus', scrollTrigger: { trigger: root, start: 'top 80%', once: true } });
  gsap.from(root.querySelector('.slider3d__controls'), { opacity: 0, y: 20, duration: 1, delay: 0.2, ease: 'nexus', scrollTrigger: { trigger: root, start: 'top 80%', once: true } });

  return { next, prev, goTo, nearestIndex };
}
