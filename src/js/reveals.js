/* Generic scroll reveals: fade-ups, masked line splits, image parallax, footer giant type */
import { gsap, ScrollTrigger, SplitText, lenis } from './core.js';

export function initReveals() {
  /* --- fade/slide reveals, batched for staggering --- */
  const reveals = gsap.utils.toArray('[data-reveal]');
  gsap.set(reveals, { opacity: 0, y: 44 });
  ScrollTrigger.batch(reveals, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.2, stagger: 0.09, ease: 'nexus', overwrite: true }),
  });

  /* --- masked line reveals for headings --- */
  const splitTargets = gsap.utils.toArray('[data-split]');
  const ready = document.fonts ? document.fonts.ready : Promise.resolve();
  ready.then(() => {
    splitTargets.forEach((el) => {
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'split-line',
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.lines, {
            yPercent: 110,
            duration: 1.4,
            stagger: 0.09,
            ease: 'nexus',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          });
        },
      });
    });
    ScrollTrigger.refresh();
  });

  /* --- parallax images --- */
  gsap.utils.toArray('[data-parallax]').forEach((el) => {
    const speed = parseFloat(el.dataset.parallax) || 0.15;
    const parent = el.parentElement;
    gsap.fromTo(el, { yPercent: -speed * 100 }, {
      yPercent: speed * 100,
      ease: 'none',
      scrollTrigger: { trigger: parent, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  /* --- footer giant wordmark --- */
  const giant = gsap.utils.toArray('[data-giant]');
  if (giant.length) {
    gsap.from(giant, {
      yPercent: 70, opacity: 0, duration: 1.6, stagger: 0.12, ease: 'nexus',
      scrollTrigger: { trigger: '.footer__giant', start: 'top 92%', once: true },
    });
    gsap.to('.footer__giant', {
      yPercent: -8, ease: 'none',
      scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true },
    });
  }

  /* --- scroll-velocity based skew on section titles (subtle) --- */
  const titles = gsap.utils.toArray('.section-title');
  const skewSetter = gsap.quickTo(titles, 'skewY', { duration: 0.6, ease: 'power3' });
  lenis.on('scroll', ({ velocity }) => {
    skewSetter(gsap.utils.clamp(-2, 2, velocity * 0.02));
  });
}
