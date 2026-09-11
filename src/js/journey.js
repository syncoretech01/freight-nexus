/* Horizontal parallax storytelling — pinned track with multi-speed layers (desktop), vertical stack on mobile */
import { gsap, ScrollTrigger, SplitText } from './core.js';

export function initJourney() {
  const section = document.getElementById('journey');
  const pin = document.getElementById('journey-pin');
  const track = document.getElementById('journey-track');
  if (!section || !pin || !track) return;
  const panels = gsap.utils.toArray('.journey__panel');
  const progress = document.getElementById('journey-progress');
  const stages = gsap.utils.toArray('.journey__stages li');
  const endTitle = section.querySelector('.journey__end h3');

  const mm = gsap.matchMedia();

  mm.add('(min-width: 901px)', () => {
    const distance = () => track.scrollWidth - window.innerWidth;

    const scrollTween = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        pin: pin,
        start: 'top top',
        end: () => `+=${distance()}`,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate(self) {
          if (progress) progress.style.transform = `scaleX(${self.progress})`;
          const stageIdx = Math.min(3, Math.floor(gsap.utils.clamp(0, 0.999, (self.progress - 0.12) / 0.76) * 4));
          stages.forEach((li, i) => li.classList.toggle('is-active', self.progress > 0.12 && i === stageIdx));
        },
      },
    });

    // layered parallax inside every panel, measured against the horizontal container animation
    panels.forEach((panel) => {
      panel.querySelectorAll('[data-speed]').forEach((el) => {
        const speed = parseFloat(el.dataset.speed) || 0.5;
        gsap.fromTo(el, { x: 190 * speed }, {
          x: -190 * speed,
          ease: 'none',
          scrollTrigger: { trigger: panel, containerAnimation: scrollTween, start: 'left right', end: 'right left', scrub: true },
        });
      });
      const img = panel.querySelector('.journey__figure img');
      if (img) {
        gsap.fromTo(img, { scale: 1.25, xPercent: -8 }, {
          scale: 1.05, xPercent: 8,
          ease: 'none',
          scrollTrigger: { trigger: panel, containerAnimation: scrollTween, start: 'left right', end: 'right left', scrub: true },
        });
      }
      const copy = panel.querySelector('.journey__copy');
      if (copy) {
        gsap.from(copy.children, {
          y: 40, opacity: 0, stagger: 0.08, duration: 1.1, ease: 'nexus',
          scrollTrigger: { trigger: panel, containerAnimation: scrollTween, start: 'left 70%', toggleActions: 'play none none reverse' },
        });
      }
    });

    // closing statement
    if (endTitle) {
      const split = new SplitText(endTitle, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
      const endPanel = endTitle.closest('.journey__panel');
      gsap.from(split.lines, {
        yPercent: 110, duration: 1.3, stagger: 0.1, ease: 'nexus',
        scrollTrigger: { trigger: endPanel, containerAnimation: scrollTween, start: 'left 60%', toggleActions: 'play none none reverse' },
      });
      gsap.from(endPanel.querySelector('.btn'), {
        y: 30, opacity: 0, duration: 1, ease: 'nexus',
        scrollTrigger: { trigger: endPanel, containerAnimation: scrollTween, start: 'left 55%', toggleActions: 'play none none reverse' },
      });
      return () => split.revert();
    }
  });

  mm.add('(max-width: 900px)', () => {
    panels.forEach((panel) => {
      const fig = panel.querySelector('.journey__figure img');
      if (fig) {
        gsap.fromTo(fig, { yPercent: -8, scale: 1.2 }, {
          yPercent: 8, scale: 1.2, ease: 'none',
          scrollTrigger: { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      }
      const items = panel.querySelectorAll('.journey__big, .journey__copy > *');
      if (items.length) {
        gsap.from(items, {
          y: 36, opacity: 0, stagger: 0.07, duration: 1, ease: 'nexus',
          scrollTrigger: { trigger: panel, start: 'top 75%', once: true },
        });
      }
    });
    if (endTitle) {
      gsap.from([endTitle, endTitle.nextElementSibling], {
        y: 40, opacity: 0, stagger: 0.12, duration: 1.1, ease: 'nexus',
        scrollTrigger: { trigger: endTitle, start: 'top 85%', once: true },
      });
    }
  });
}
