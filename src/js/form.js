/* Quote form — segmented control, validation micro-interactions, success state */
import { gsap } from './core.js';

export function initForm() {
  const form = document.getElementById('quote-form');
  if (!form) return;
  const pill = document.getElementById('segmented-pill');
  const radios = [...form.querySelectorAll('input[name="freight"]')];
  const submit = document.getElementById('form-submit');
  const success = document.getElementById('form-success');
  const circle = document.getElementById('success-circle');
  const check = document.getElementById('success-check');

  /* segmented pill follows the checked option */
  const stacked = () => window.matchMedia('(max-width: 640px)').matches;
  function movePill(animate = true) {
    const idx = Math.max(0, radios.findIndex((r) => r.checked));
    const props = stacked() ? { xPercent: 0, yPercent: idx * 100 } : { yPercent: 0, xPercent: idx * 100 };
    gsap.to(pill, { ...props, duration: animate ? 0.6 : 0, ease: 'nexus', overwrite: true });
  }
  radios.forEach((r) => r.addEventListener('change', () => movePill(true)));
  window.addEventListener('resize', () => movePill(false));
  movePill(false);

  /* validation */
  const fields = [...form.querySelectorAll('.field')];
  fields.forEach((f) => {
    const input = f.querySelector('input, textarea');
    input.addEventListener('input', () => f.classList.remove('is-invalid'));
  });
  function validate() {
    let ok = true;
    fields.forEach((f) => {
      const input = f.querySelector('input, textarea');
      if (!input.required) return;
      let valid = input.value.trim().length > 1;
      if (input.type === 'email') valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      if (!valid) {
        ok = false;
        f.classList.add('is-invalid');
        gsap.fromTo(f, { x: -6 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
      }
    });
    return ok;
  }

  gsap.set(success, { visibility: 'hidden', opacity: 0 });
  gsap.set([circle, check], { drawSVG: '0%' });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) return;
    const label = submit.querySelector('.btn__label');
    const original = label.textContent;
    submit.disabled = true;
    label.textContent = 'Sending…';
    gsap.to(submit, { scale: 0.97, duration: 0.2, yoyo: true, repeat: 1 });

    // simulated request
    setTimeout(() => {
      gsap.timeline()
        .set(success, { visibility: 'visible' })
        .to(success, { opacity: 1, duration: 0.6, ease: 'power2.out' })
        .fromTo(circle, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.9, ease: 'power2.inOut' }, 0.2)
        .fromTo(check, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.6, ease: 'power2.out' }, 0.8)
        .from(success.querySelectorAll('h3, p'), { y: 20, opacity: 0, stagger: 0.1, duration: 0.8, ease: 'nexus' }, 0.9);
      label.textContent = original;
      submit.disabled = false;
      form.reset();
      movePill(false);
    }, 1200);
  });

  /* footer newsletter */
  const news = document.getElementById('footer-news');
  if (news) {
    news.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = news.querySelector('input');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
        gsap.fromTo(news, { x: -6 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
        return;
      }
      input.value = '';
      input.placeholder = "You're on the list.";
      gsap.fromTo(news.querySelector('button'), { rotate: -45, scale: 0.8 }, { rotate: 0, scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    });
  }
}
