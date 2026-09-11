/* Preloader — wordmark reveal, counter, then a five-column curtain wipe */
import { gsap, SplitText, lenis, reducedMotion } from './core.js';

function waitForImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
  });
}

export function runPreloader() {
  return new Promise((resolve) => {
    const el = document.getElementById('preloader');
    if (!el) { resolve(); return; }

    const words = el.querySelectorAll('[data-preload-word]');
    const logo = el.querySelector('.preloader__logo');
    const num = document.getElementById('preloader-num');
    const bar = document.getElementById('preloader-bar');
    const barWrap = el.querySelector('.preloader__bar');
    const cols = el.querySelectorAll('.preloader__cols span');
    const meta = el.querySelector('.preloader__meta');

    lenis.stop();
    window.scrollTo(0, 0);

    const split = new SplitText(words, { type: 'chars', charsClass: 'char' });
    gsap.set(split.chars, { yPercent: 115 });
    gsap.set(logo, { opacity: 1 });
    gsap.set(meta, { opacity: 0, y: 12 });

    const counter = { v: 0 };
    const duration = reducedMotion ? 0.6 : 2.3;

    const tl = gsap.timeline();
    tl.to(split.chars, { yPercent: 0, duration: 1.2, stagger: 0.032, ease: 'nexus' }, 0.15)
      .to(meta, { opacity: 1, y: 0, duration: 0.9 }, 0.55)
      .to(counter, {
        v: 100,
        duration,
        ease: 'power2.inOut',
        onUpdate() {
          const v = Math.round(counter.v);
          num.textContent = String(v).padStart(2, '0');
          bar.style.transform = `scaleX(${counter.v / 100})`;
        },
      }, 0.35);

    const assets = Promise.all([
      document.fonts ? document.fonts.ready : Promise.resolve(),
      waitForImage('/images/hero-truck.jpg'),
      tl.then(),
    ]);

    assets.then(() => {
      const out = gsap.timeline({
        onComplete() {
          el.remove();
        },
      });
      out.to(split.chars, { yPercent: -118, duration: 0.75, stagger: 0.018, ease: 'power3.in' })
        .to([meta, barWrap], { opacity: 0, y: -24, duration: 0.5, ease: 'power2.in' }, '<0.1')
        .to(cols, { scaleY: 0, duration: 1.15, stagger: 0.075, ease: 'nexusInOut' }, '-=0.25')
        .add(() => {
          document.documentElement.classList.remove('is-loading');
          lenis.start();
          resolve();
        }, '-=0.95');
    });
  });
}
