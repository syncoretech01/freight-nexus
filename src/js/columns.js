/* Network — vertical columns sliding in opposite directions at different speeds while the section scrolls */
import { gsap } from './core.js';

export function initColumns() {
  const wrap = document.getElementById('columns');
  if (!wrap) return;
  const cols = gsap.utils.toArray('.columns__col', wrap);

  cols.forEach((col) => {
    const dir = parseFloat(col.dataset.dir) || -1;
    const travel = () => Math.max(0, col.scrollHeight - wrap.clientHeight);
    gsap.fromTo(col,
      { y: () => (dir > 0 ? -travel() : 0) },
      {
        y: () => (dir > 0 ? -travel() + travel() * Math.abs(dir) : -travel() * Math.abs(dir)),
        ease: 'none',
        scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
      });
  });

  // hub cards fade in as the wall of columns enters
  gsap.from('.hub', {
    opacity: 0, y: 40, duration: 1.1, stagger: { each: 0.04, from: 'random' }, ease: 'nexus',
    scrollTrigger: { trigger: wrap, start: 'top 80%', once: true },
  });
}
