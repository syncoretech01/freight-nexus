/* Hero entrance choreography + hero-only scroll parallax */
import { gsap, ScrollTrigger } from './core.js';
import { runCounter } from './counters.js';

export function prepareHero() {
  // wrap each title line so it can slide up inside a clipped mask
  document.querySelectorAll('.hero__line').forEach((line) => {
    const inner = document.createElement('span');
    inner.className = 'hero__line-inner';
    inner.innerHTML = line.innerHTML;
    line.innerHTML = '';
    line.appendChild(inner);
  });
  gsap.set('.hero__line-inner', { yPercent: 112, rotate: 3, transformOrigin: 'left top' });
  gsap.set('[data-hero="eyebrow"]', { opacity: 0, x: -24 });
  gsap.set('[data-hero="lead"], [data-hero="actions"] > *', { opacity: 0, y: 34 });
  gsap.set('[data-hero="stats"] > li', { opacity: 0, y: 30 });
  gsap.set('[data-hero="scroll"], [data-hero="side"]', { opacity: 0 });
  gsap.set('.nav__inner', { yPercent: -110, opacity: 0 });
}

export function heroIntro(scene) {
  const tl = gsap.timeline({ defaults: { ease: 'nexus' } });
  tl.to('.nav__inner', { yPercent: 0, opacity: 1, duration: 1.4, clearProps: 'all' }, 0.2)
    .to('[data-hero="eyebrow"]', { opacity: 1, x: 0, duration: 1.1 }, 0.25)
    .to('.hero__line-inner', { yPercent: 0, rotate: 0, duration: 1.6, stagger: 0.11 }, 0.3)
    .to('[data-hero="lead"]', { opacity: 1, y: 0, duration: 1.2 }, 0.85)
    .to('[data-hero="actions"] > *', { opacity: 1, y: 0, duration: 1.1, stagger: 0.1 }, 1.0)
    .to('[data-hero="stats"] > li', { opacity: 1, y: 0, duration: 1.1, stagger: 0.09 }, 1.15)
    .to('[data-hero="scroll"], [data-hero="side"]', { opacity: 1, duration: 1.2 }, 1.6)
    .add(() => {
      document.querySelectorAll('.hero__stats [data-counter]').forEach((el, i) => runCounter(el, { delay: i * 0.1, duration: 2.4 }));
    }, 1.2);
  if (scene) scene.intro();

  // scroll-out parallax for the copy
  gsap.to('.hero__content', {
    yPercent: -18,
    opacity: 0.2,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('.hero__stats', {
    yPercent: -35,
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: '70% top', scrub: true },
  });
  return tl;
}
