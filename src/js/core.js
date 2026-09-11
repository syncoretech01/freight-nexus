/* Shared runtime: GSAP + plugins, Lenis smooth scroll, environment flags */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { CustomEase } from 'gsap/CustomEase';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText, Draggable, InertiaPlugin, DrawSVGPlugin, CustomEase);

CustomEase.create('nexus', 'M0,0 C0.16,1 0.3,1 1,1');
CustomEase.create('nexusInOut', 'M0,0 C0.76,0 0.24,1 1,1');

gsap.defaults({ ease: 'nexus', duration: 1 });
ScrollTrigger.config({ ignoreMobileResize: true });

export const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isDesktop = () => window.matchMedia('(min-width: 1025px)').matches;

/* Lenis — driven by GSAP's ticker so ScrollTrigger and the scroll share one clock */
export const lenis = new Lenis({
  lerp: 0.085,
  duration: 1.2,
  smoothWheel: true,
  wheelMultiplier: 0.95,
  touchMultiplier: 1.4,
  autoRaf: false,
  anchors: false,
});
lenis.on('scroll', ScrollTrigger.update);
window.__lenis = lenis;
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

export const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function scrollToTarget(target, opts = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  lenis.scrollTo(el, { offset: 0, duration: 1.6, easing: easeOutExpo, ...opts });
}

export { gsap, ScrollTrigger, SplitText, Draggable };
