/* 3D tilt cards with a pointer-tracking glare */
import { gsap, isTouch } from './core.js';

export function initTilt() {
  const cards = gsap.utils.toArray('[data-tilt]');
  if (!cards.length) return;

  gsap.from(cards, {
    y: 70, opacity: 0, duration: 1.3, stagger: 0.09, ease: 'nexus',
    scrollTrigger: { trigger: '#tilt-grid', start: 'top 85%', once: true },
  });

  if (isTouch) return;

  cards.forEach((card) => {
    gsap.set(card, { transformPerspective: 1100 });
    const rxTo = gsap.quickTo(card, 'rotationX', { duration: 0.7, ease: 'power3' });
    const ryTo = gsap.quickTo(card, 'rotationY', { duration: 0.7, ease: 'power3' });
    const sxTo = gsap.quickTo(card, 'scaleX', { duration: 0.7, ease: 'power3' });
    const syTo = gsap.quickTo(card, 'scaleY', { duration: 0.7, ease: 'power3' });
    const sTo = (v) => { sxTo(v); syTo(v); };
    const max = 12;
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      ryTo((px - 0.5) * max);
      rxTo(-(py - 0.5) * max);
      sTo(1.025);
      card.style.setProperty('--gx', `${px * 100}%`);
      card.style.setProperty('--gy', `${py * 100}%`);
    });
    card.addEventListener('mouseleave', () => { rxTo(0); ryTo(0); sTo(1); });
  });
}
