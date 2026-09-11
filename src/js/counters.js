/* Animated number counters — powered by Motion (motion.dev) */
import { animate, inView } from 'motion';

function format(value, decimals) {
  const fixed = value.toFixed(decimals);
  const [int, dec] = fixed.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return dec ? `${grouped}.${dec}` : grouped;
}

export function runCounter(el, { duration = 2.2, delay = 0 } = {}) {
  if (el.dataset.counted) return;
  el.dataset.counted = '1';
  const target = parseFloat(el.dataset.counter);
  const decimals = parseInt(el.dataset.decimals || '0', 10);
  const suffix = el.dataset.suffix || '';
  animate(0, target, {
    duration,
    delay,
    ease: [0.16, 1, 0.3, 1],
    onUpdate: (v) => { el.textContent = format(v, decimals) + suffix; },
  });
}

/* Count up when the element scrolls into view (once) */
export function initCounters(scope = document) {
  const root = typeof scope === 'string' ? document.querySelector(scope) : scope;
  if (!root) return;
  root.querySelectorAll('[data-counter]').forEach((el, i) => {
    const stop = inView(el, () => {
      runCounter(el, { delay: i * 0.08 });
      stop();
    }, { amount: 0.6 });
  });
}
