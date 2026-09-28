/* Network — an animated map of the US lane network.
   Lanes draw themselves in on scroll, freight pulses run the corridors
   continuously (pure CSS, so it costs no per-frame JS), and hovering or
   tapping a hub isolates everything that touches it. */
import { gsap, ScrollTrigger, isTouch } from './core.js';
import { VIEWBOX, NATION_PATH, STATES_PATH, HUBS, LANES } from './us-map-data.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const el = (name, attrs = {}) => {
  const n = document.createElementNS(SVG_NS, name);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
};

export function initNetworkMap() {
  const root = document.getElementById('network-map');
  if (!root) return;

  const stage = root.querySelector('.usmap__stage');
  const tip = root.querySelector('.usmap__tip');
  const readout = root.querySelector('.usmap__readout');

  const svg = el('svg', {
    viewBox: VIEWBOX,
    class: 'usmap__svg',
    role: 'img',
    'aria-label': 'Freight Nexus lane network across the United States',
    preserveAspectRatio: 'xMidYMid meet',
  });

  /* --- defs: land gradient + lane glow --- */
  const defs = el('defs');
  defs.innerHTML = `
    <linearGradient id="fn-land" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0b2f57"/>
      <stop offset="100%" stop-color="#002347"/>
    </linearGradient>
    <radialGradient id="fn-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#17b3ad" stop-opacity=".30"/>
      <stop offset="100%" stop-color="#17b3ad" stop-opacity="0"/>
    </radialGradient>`;
  svg.appendChild(defs);

  svg.appendChild(el('ellipse', { cx: 500, cy: 320, rx: 470, ry: 290, fill: 'url(#fn-glow)' }));
  svg.appendChild(el('path', { d: NATION_PATH, class: 'usmap__land', fill: 'url(#fn-land)' }));
  svg.appendChild(el('path', { d: STATES_PATH, class: 'usmap__borders', fill: 'none' }));
  svg.appendChild(el('path', { d: NATION_PATH, class: 'usmap__coast', fill: 'none' }));

  /* --- lanes --- */
  const laneLayer = el('g', { class: 'usmap__lanes' });
  const flowLayer = el('g', { class: 'usmap__flows' });
  const laneNodes = [];
  LANES.forEach((lane, i) => {
    const base = el('path', { d: lane.d, class: 'usmap__lane', fill: 'none' });
    const flow = el('path', { d: lane.d, class: 'usmap__flow', fill: 'none' });
    const len = base.getTotalLength ? 0 : 0; // measured after mount
    base.dataset.a = lane.a; base.dataset.b = lane.b;
    flow.dataset.a = lane.a; flow.dataset.b = lane.b;
    // stagger the traffic so the corridors never pulse in lockstep
    flow.style.animationDelay = `${(i % 7) * 0.9 + Math.random() * 0.6}s`;
    flow.style.animationDuration = `${3.4 + lane.len / 120}s`;
    laneLayer.appendChild(base);
    flowLayer.appendChild(flow);
    laneNodes.push({ base, flow, lane, len });
  });
  svg.appendChild(laneLayer);
  svg.appendChild(flowLayer);

  /* --- hubs --- */
  const hubLayer = el('g', { class: 'usmap__hubs' });
  const hubNodes = HUBS.map((h) => {
    const g = el('g', { class: 'usmap__hub', tabindex: '0', role: 'button',
      'aria-label': `${h.name} — ${h.kind}` });
    g.dataset.id = h.id;
    g.appendChild(el('circle', { cx: h.x, cy: h.y, r: 15, class: 'usmap__hit', fill: 'transparent' }));
    const halo = el('circle', { cx: h.x, cy: h.y, r: 4, class: 'usmap__halo', fill: 'none' });
    g.appendChild(halo);
    g.appendChild(el('circle', { cx: h.x, cy: h.y, r: 3.6, class: 'usmap__dot' }));
    hubLayer.appendChild(g);
    return { g, hub: h, halo };
  });
  svg.appendChild(hubLayer);
  stage.appendChild(svg);

  /* --- measure lane lengths so the draw-in and the flow dash are exact --- */
  laneNodes.forEach((n) => {
    const len = n.base.getTotalLength();
    n.len = len;
    n.base.style.strokeDasharray = `${len}`;
    n.base.style.strokeDashoffset = `${len}`;
    // a short lit segment chasing along an otherwise invisible copy of the path
    n.flow.style.strokeDasharray = `26 ${Math.max(40, len - 26)}`;
    n.flow.style.setProperty('--flow-len', `${len}`);
  });

  /* --- scroll entrance --- */
  const tl = gsap.timeline({
    scrollTrigger: { trigger: root, start: 'top 72%', once: true },
  });
  tl.from(svg.querySelector('.usmap__land'), { opacity: 0, duration: 1.1, ease: 'power2.out' })
    .from(svg.querySelector('.usmap__borders'), { opacity: 0, duration: 1.2 }, 0.2)
    .from(svg.querySelector('.usmap__coast'), { opacity: 0, duration: 1.2 }, 0.2)
    .to(laneNodes.map((n) => n.base), {
      strokeDashoffset: 0,
      duration: 1.5,
      ease: 'power2.inOut',
      stagger: { each: 0.045, from: 'random' },
    }, 0.35)
    .add(() => root.classList.add('is-live'), '-=0.6')
    .from(hubNodes.map((n) => n.g), {
      opacity: 0, scale: 0, transformOrigin: 'center',
      duration: 0.7, ease: 'back.out(2)',
      stagger: { each: 0.04, from: 'random' },
      svgOrigin: undefined,
    }, '-=1.1');

  /* --- interaction --- */
  let activeId = null;
  const byId = Object.fromEntries(HUBS.map((h) => [h.id, h]));
  const linkCount = (id) => LANES.filter((l) => l.a === id || l.b === id).length;

  function renderReadout(h, links) {
    if (!readout) return;
    readout.innerHTML = `<span class="eyebrow eyebrow--accent">${h.kind}</span>`
      + `<h4>${h.name}</h4><p>${h.meta}</p>`
      + `<span class="usmap__readout-links">${links} direct lanes</span>`;
  }

  function setActive(id) {
    if (activeId === id) return;
    activeId = id;
    root.classList.toggle('is-focused', Boolean(id));
    hubNodes.forEach((n) => n.g.classList.toggle('is-on', n.hub.id === id));
    laneNodes.forEach((n) => {
      const on = id && (n.lane.a === id || n.lane.b === id);
      n.base.classList.toggle('is-on', Boolean(on));
      n.flow.classList.toggle('is-on', Boolean(on));
      n.base.classList.toggle('is-off', Boolean(id) && !on);
      n.flow.classList.toggle('is-off', Boolean(id) && !on);
    });
    if (id) {
      const h = byId[id];
      const links = LANES.filter((l) => l.a === id || l.b === id).length;
      renderReadout(h, links);
      tip.innerHTML = `<span class="usmap__tip-kind">${h.kind}</span>`
        + `<strong>${h.name}</strong>`
        + `<small>${h.meta} · ${links} direct lane${links === 1 ? '' : 's'}</small>`;
      const r = stage.getBoundingClientRect();
      const x = (h.x / 1000) * r.width;
      const y = (h.y / 620) * r.height;
      tip.style.transform = `translate(${x}px, ${y}px)`;
      tip.classList.toggle('usmap__tip--left', x > r.width * 0.62);
      tip.classList.add('is-on');
    } else {
      tip.classList.remove('is-on');
    }
  }

  hubNodes.forEach(({ g, hub }) => {
    const on = () => setActive(hub.id);
    const off = () => setActive(null);
    if (isTouch) {
      g.addEventListener('click', () => setActive(activeId === hub.id ? null : hub.id));
    } else {
      g.addEventListener('mouseenter', on);
      g.addEventListener('mouseleave', off);
    }
    g.addEventListener('focus', on);
    g.addEventListener('blur', off);
  });
  stage.addEventListener('mouseleave', () => setActive(null));

  /* --- idle readout: follow the focused hub, otherwise cycle --- */
  if (readout) {
    const order = ['chi', 'lax', 'sav', 'mci', 'ewr', 'hou', 'mem', 'sea'];
    let i = 0;
    let timer = null;
    const step = () => {
      if (activeId) return;
      const h = byId[order[i % order.length]];
      i += 1;
      const links = linkCount(h.id);
      gsap.timeline()
        .to(readout, { opacity: 0, y: -8, duration: 0.35, ease: 'power2.in' })
        .add(() => renderReadout(h, links))
        .to(readout, { opacity: 1, y: 0, duration: 0.5, ease: 'nexus' });
    };
    step();
    ScrollTrigger.create({
      trigger: root,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => {
        clearInterval(timer);
        timer = self.isActive ? setInterval(step, 3600) : null;
      },
    });
  }
}
