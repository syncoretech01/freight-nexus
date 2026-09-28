/* Immersive zoom — a framed photograph grows to fill the viewport, then a manifesto fills in word by word */
import { gsap, SplitText } from './core.js';

export function initZoom() {
  const section = document.querySelector('.zoom');
  if (!section) return;
  const frame = document.getElementById('zoom-frame');
  const img = document.getElementById('zoom-img');
  const shade = frame.querySelector('.zoom__shade');
  const caption = document.getElementById('zoom-caption');
  const manifesto = document.getElementById('zoom-manifesto');
  const text = manifesto.querySelector('[data-fill-text]');

  const split = new SplitText(text, { type: 'words', wordsClass: 'word' });
  const mobile = window.matchMedia('(max-width: 768px)').matches;
  // drive clip-path through a proxy: browsers collapse inset() shorthands, which breaks string interpolation
  const clip = mobile ? { t: 26, r: 8, b: 26, l: 8, rad: 20 } : { t: 24, r: 24, b: 24, l: 24, rad: 28 };
  const applyClip = () => { frame.style.clipPath = `inset(${clip.t}% ${clip.r}% ${clip.b}% ${clip.l}% round ${clip.rad}px)`; };
  applyClip();
  gsap.set(img, { scale: 1.4 });
  gsap.set(shade, { opacity: 0.35 });
  gsap.set(manifesto, { opacity: 0 });
  gsap.set(caption, { opacity: 0, y: 30, scale: 0.62 });

  // caption pops in as the section arrives
  gsap.to(caption, {
    opacity: 1, y: 0, duration: 1.4, ease: 'nexus',
    scrollTrigger: { trigger: section, start: 'top 60%', once: true },
  });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.8 },
  });
  tl.to(clip, { t: 0, r: 0, b: 0, l: 0, rad: 0, duration: 4, ease: 'power2.inOut', onUpdate: applyClip }, 0)
    .to(caption, { scale: 1, duration: 4, ease: 'power2.inOut' }, 0)
    .to(img, { scale: 1.06, duration: 5 }, 0)
    .to(caption, { y: -70, opacity: 0, duration: 1.2, ease: 'power2.in' }, 2.4)
    .set(caption, { visibility: 'hidden' }, 3.6)
    .to(shade, { opacity: 0.94, duration: 1.8 }, 2.8)
    .to(manifesto, { opacity: 1, duration: 0.5 }, 4)
    .to(split.words, { color: 'rgba(247, 250, 255, 1)', duration: 0.5, stagger: 0.14 }, 4.3)
    .to(img, { scale: 1.2, duration: 5 }, 5)
    .to(manifesto, { yPercent: -8, duration: 2 }, 8);
}
