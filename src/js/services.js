/* Services list — cursor-following hover-reveal preview, row entrance, freight-type handoff to the form */
import { gsap, isTouch, isDesktop } from './core.js';

export function initServices() {
  const list = document.getElementById('services-list');
  const preview = document.getElementById('services-preview');
  if (!list || !preview) return;
  const rows = list.querySelectorAll('.services__row');
  const imgs = preview.querySelectorAll('img');

  gsap.set(preview, { xPercent: -50, yPercent: -50, scale: 0.6, opacity: 0 });

  if (!isTouch && isDesktop()) {
    const xTo = gsap.quickTo(preview, 'x', { duration: 0.55, ease: 'power3' });
    const yTo = gsap.quickTo(preview, 'y', { duration: 0.55, ease: 'power3' });
    const rotTo = gsap.quickTo(preview, 'rotation', { duration: 0.7, ease: 'power3' });
    let lastX = null;
    let raf = null;
    list.addEventListener('mousemove', (e) => {
      xTo(e.clientX + 40);
      yTo(e.clientY);
      if (lastX !== null) rotTo(gsap.utils.clamp(-7, 7, (e.clientX - lastX) * 0.25));
      lastX = e.clientX;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => rotTo(0));
    });
    rows.forEach((row) => {
      row.addEventListener('mouseenter', () => {
        const idx = parseInt(row.dataset.preview, 10);
        imgs.forEach((im, i) => im.classList.toggle('is-active', i === idx));
        gsap.to(preview, { scale: 1, opacity: 1, duration: 0.7, ease: 'nexus', overwrite: 'auto' });
      });
      row.addEventListener('mouseleave', () => {
        gsap.to(preview, { scale: 0.6, opacity: 0, duration: 0.45, ease: 'power3.out', overwrite: 'auto' });
      });
    });
  }

  gsap.from(rows, {
    y: 70, opacity: 0, duration: 1.3, stagger: 0.12, ease: 'nexus',
    scrollTrigger: { trigger: list, start: 'top 85%', once: true },
  });

  // choosing a service pre-selects the matching freight type in the quote form
  rows.forEach((row) => {
    row.addEventListener('click', () => {
      const radio = document.querySelector(`input[name="freight"][value="${row.dataset.freight}"]`);
      if (radio && !radio.checked) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  });
}
