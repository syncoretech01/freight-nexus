/* Custom cursor — dot + lagging ring, contextual labels, magnetic buttons */
import { gsap, isTouch } from './core.js';

export function initCursor() {
  if (isTouch) return;
  const cursor = document.getElementById('cursor');
  if (!cursor) return;
  const dot = cursor.querySelector('.cursor__dot');
  const ring = cursor.querySelector('.cursor__ring');
  const label = cursor.querySelector('.cursor__label');

  const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
  const ringX = gsap.quickTo(ring, 'x', { duration: 0.42, ease: 'power3' });
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.42, ease: 'power3' });

  let shown = false;
  window.addEventListener('mousemove', (e) => {
    dotX(e.clientX); dotY(e.clientY);
    ringX(e.clientX); ringY(e.clientY);
    if (!shown) { shown = true; cursor.classList.add('is-visible'); }
    cursor.classList.remove('is-hidden');
  }, { passive: true });

  document.addEventListener('mouseleave', () => cursor.classList.add('is-hidden'));
  document.addEventListener('mouseenter', () => cursor.classList.remove('is-hidden'));
  window.addEventListener('mousedown', () => cursor.classList.add('is-down'));
  window.addEventListener('mouseup', () => cursor.classList.remove('is-down'));

  const INTERACTIVE = 'a, button, summary, label, input, textarea, [data-cursor]';
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest(INTERACTIVE);
    if (!t) return;
    const type = t.closest('[data-cursor]')?.dataset.cursor;
    if (type) {
      label.textContent = type;
      cursor.classList.add('is-label');
      cursor.classList.remove('is-hover');
    } else {
      cursor.classList.add('is-hover');
      cursor.classList.remove('is-label');
    }
  });
  document.addEventListener('pointerout', (e) => {
    const t = e.target.closest(INTERACTIVE);
    if (!t) return;
    const to = e.relatedTarget?.closest?.(INTERACTIVE);
    if (to) return;
    cursor.classList.remove('is-hover', 'is-label');
  });
}

/* Magnetic elements pull toward the pointer and spring back */
export function initMagnetic() {
  if (isTouch) return;
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const strength = parseFloat(el.dataset.magnetic) || 0.32;
    const label = el.querySelector('.btn__label, span');
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
    let lx, ly;
    if (label) {
      lx = gsap.quickTo(label, 'x', { duration: 0.6, ease: 'power3' });
      ly = gsap.quickTo(label, 'y', { duration: 0.6, ease: 'power3' });
    }
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      xTo(dx * strength); yTo(dy * strength);
      if (lx) { lx(dx * strength * 0.35); ly(dy * strength * 0.35); }
    });
    el.addEventListener('mouseleave', () => {
      xTo(0); yTo(0);
      if (lx) { lx(0); ly(0); }
    });
  });
}
