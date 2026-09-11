/* FAQ accordion — native <details> semantics with animated open/close */
import { gsap } from './core.js';

export function initFaq() {
  const items = document.querySelectorAll('.faq__item');
  items.forEach((item) => {
    const summary = item.querySelector('summary');
    const body = item.querySelector('.faq__body');
    let animating = false;

    summary.addEventListener('click', (e) => {
      e.preventDefault();
      if (animating) return;
      animating = true;

      if (item.open) {
        gsap.to(body, {
          height: 0, opacity: 0, duration: 0.5, ease: 'power3.inOut',
          onComplete() { item.open = false; gsap.set(body, { clearProps: 'height,opacity' }); animating = false; },
        });
      } else {
        // close siblings for a tidy single-open accordion
        items.forEach((other) => {
          if (other !== item && other.open) {
            const ob = other.querySelector('.faq__body');
            gsap.to(ob, { height: 0, opacity: 0, duration: 0.45, ease: 'power3.inOut', onComplete() { other.open = false; gsap.set(ob, { clearProps: 'height,opacity' }); } });
          }
        });
        item.open = true;
        gsap.fromTo(body, { height: 0, opacity: 0 }, {
          height: 'auto', opacity: 1, duration: 0.65, ease: 'power3.out',
          onComplete() { gsap.set(body, { clearProps: 'height' }); animating = false; },
        });
      }
    });
  });
}
