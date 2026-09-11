/* Process — sticky stacking cards; each card scales back and dims as the next one slides over it */
import { gsap } from './core.js';

export function initProcess() {
  const stack = document.getElementById('process-stack');
  if (!stack) return;
  const cards = gsap.utils.toArray('.process__card', stack);

  cards.forEach((card, i) => {
    // entrance: content rises as the card reaches its resting spot
    gsap.from(card.querySelectorAll('.process__card-text > *'), {
      y: 40, opacity: 0, stagger: 0.07, duration: 1, ease: 'nexus',
      scrollTrigger: { trigger: card, start: 'top 80%', once: true },
    });
    const media = card.querySelector('.process__card-media img');
    if (media) {
      gsap.fromTo(media, { scale: 1.2 }, {
        scale: 1, ease: 'none',
        scrollTrigger: { trigger: card, start: 'top bottom', end: 'top top', scrub: true },
      });
    }

    const next = cards[i + 1];
    if (!next) return;
    gsap.to(card, {
      scale: 0.92,
      '--dim': 0.42,
      ease: 'none',
      transformOrigin: 'center top',
      scrollTrigger: {
        trigger: next,
        start: 'top bottom',
        end: () => `top ${parseFloat(getComputedStyle(next).top) || 100}px`,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
  });
}
