import './styles/main.css';
import { gsap, ScrollTrigger } from './js/core.js';
import { runPreloader } from './js/preloader.js';
import { initCursor, initMagnetic } from './js/cursor.js';
import { initNav } from './js/nav.js';
import { initHeroScene } from './js/hero-scene.js';
import { prepareHero, heroIntro } from './js/hero.js';
import { initZoom } from './js/zoom.js';
import { initMarquee } from './js/marquee.js';
import { initServices } from './js/services.js';
import { initJourney } from './js/journey.js';
import { initProcess } from './js/process.js';
import { initNetworkMap } from './js/network-map.js';
import { initCounters } from './js/counters.js';
import { initTilt } from './js/tilt.js';
import { initSlider3D } from './js/slider3d.js';
import { initFaq } from './js/faq.js';
import { initForm } from './js/form.js';
import { initReveals } from './js/reveals.js';

history.scrollRestoration = 'manual';
document.documentElement.classList.add('js');

/* Hero WebGL scene boots immediately so its first frame is ready behind the preloader */
prepareHero();
const heroScene = initHeroScene(document.getElementById('hero-canvas'));

initCursor();
initNav();
initMagnetic();
initZoom();
initMarquee();
initServices();
/* The container scene is ~0.5 MB of Three.js work; load it only once the
   section is within a screen of the viewport so it never blocks first paint. */
const inside = document.getElementById('inside');
if (inside) {
  const io = new IntersectionObserver((entries, obs) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    obs.disconnect();
    import('./js/explode-scene.js').then(({ initExplodeScene }) => {
      initExplodeScene({
        canvas: document.getElementById('explode-canvas'),
        stage: document.getElementById('explode-stage'),
        section: inside,
        labels: document.getElementById('explode-labels'),
        items: document.getElementById('explode-list'),
        progressBar: document.getElementById('explode-progress-bar'),
      });
      ScrollTrigger.refresh();
    });
  }, { rootMargin: '100% 0px' });
  io.observe(inside);
}
initJourney();
initProcess();
initNetworkMap();
initCounters('#stats');
initTilt();
initSlider3D();
initFaq();
initForm();
initReveals();

runPreloader().then(() => {
  heroIntro(heroScene);
  ScrollTrigger.refresh();
});

window.addEventListener('load', () => ScrollTrigger.refresh());

/* Recalculate pinned distances once late-loading images settle */
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
});

console.info('%cFreight Nexus', 'font-family: serif; font-size: 20px; color: #e8a6b2; background: #0a2c2d; padding: 6px 12px; border-radius: 6px;', '— moving what matters, across every mile.');
