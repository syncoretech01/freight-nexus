/* Navigation: glass on scroll, hide/show on direction, active section, fullscreen menu, anchor scrolling */
import { gsap, ScrollTrigger, lenis, scrollToTarget } from './core.js';

export function initNav() {
  const nav = document.getElementById('nav');
  const menu = document.getElementById('menu');
  const toggle = document.getElementById('menu-toggle');
  const menuLinks = menu.querySelectorAll('.menu__link');
  const menuBlocks = menu.querySelectorAll('.menu__aside > *');
  const menuBg = menu.querySelector('.menu__bg img');
  let menuOpen = false;

  /* --- scroll behaviour --- */
  let lastY = 0;
  lenis.on('scroll', ({ scroll, direction }) => {
    nav.classList.toggle('is-scrolled', scroll > 40);
    if (menuOpen) return;
    if (scroll > 400 && direction === 1 && scroll > lastY + 2) nav.classList.add('is-hidden');
    else if (direction === -1 || scroll < 400) nav.classList.remove('is-hidden');
    lastY = scroll;
  });

  /* --- active link --- */
  nav.querySelectorAll('.nav__link').forEach((link) => {
    const id = link.getAttribute('href');
    const section = document.querySelector(id);
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: (self) => link.classList.toggle('is-active', self.isActive),
    });
  });

  /* --- fullscreen menu --- */
  gsap.set(menuLinks, { yPercent: 110, opacity: 0 });
  gsap.set(menuBlocks, { y: 24, opacity: 0 });

  const clip = { v: 100 };
  const applyClip = () => { menu.style.clipPath = `inset(0 0 ${clip.v}% 0)`; };
  applyClip();
  const openTl = gsap.timeline({ paused: true });
  openTl
    .set(menu, { visibility: 'visible' })
    .to(clip, { v: 0, duration: 1.05, ease: 'nexusInOut', onUpdate: applyClip })
    .fromTo(menuBg, { scale: 1.2 }, { scale: 1, duration: 2.2, ease: 'nexus' }, 0.1)
    .to(menuLinks, { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.06, ease: 'nexus' }, 0.45)
    .to(menuBlocks, { y: 0, opacity: 1, duration: 0.9, stagger: 0.08 }, 0.7);

  function openMenu() {
    menuOpen = true;
    nav.classList.add('is-menu-open');
    nav.classList.remove('is-hidden');
    toggle.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    menu.setAttribute('aria-hidden', 'false');
    lenis.stop();
    openTl.timeScale(1).play();
  }
  function closeMenu() {
    menuOpen = false;
    nav.classList.remove('is-menu-open');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    menu.setAttribute('aria-hidden', 'true');
    lenis.start();
    openTl.timeScale(1.6).reverse();
  }
  toggle.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) closeMenu(); });

  /* --- anchor scrolling (Lenis) --- */
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-scroll-to]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const go = () => scrollToTarget(target, { onComplete: () => nav.classList.remove('is-hidden') });
    if (menuOpen) { closeMenu(); setTimeout(go, 350); } else go();
    history.replaceState(null, '', href);
  });

  // placeholder links (legal, socials) should not jump the page
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href="#"]');
    if (a) e.preventDefault();
  });

  document.getElementById('back-to-top')?.addEventListener('click', () => {
    lenis.scrollTo(0, { duration: 1.8 });
  });
}
