/* Infinite marquee whose speed and direction react to scroll velocity */
import { gsap, lenis } from './core.js';

export function initMarquee() {
  const marquee = document.getElementById('marquee');
  if (!marquee) return;
  const inner = marquee.querySelector('.marquee__inner');

  const tween = gsap.to(inner, { xPercent: -50, ease: 'none', duration: 30, repeat: -1 });
  const skewTo = gsap.quickTo(inner, 'skewX', { duration: 0.5, ease: 'power3' });
  const speedTo = gsap.quickTo(tween, 'timeScale', { duration: 0.5, ease: 'power2.out' });
  let dir = 1;
  let settle;

  lenis.on('scroll', ({ velocity }) => {
    const v = gsap.utils.clamp(0, 4, Math.abs(velocity) / 14);
    if (Math.abs(velocity) > 0.4) dir = velocity < 0 ? -1 : 1;
    speedTo(dir * (1 + v));
    skewTo(gsap.utils.clamp(-9, 9, -velocity * 0.12));
    // settle back to cruising speed when scrolling stops
    clearTimeout(settle);
    settle = setTimeout(() => { skewTo(0); speedTo(dir); }, 140);
  });
}
