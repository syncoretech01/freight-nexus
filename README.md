# Freight Nexus

Premium single-page website for **Freight Nexus** — an intermodal, grain and general freight brokerage.
Built with Vite, Three.js, GSAP (ScrollTrigger · SplitText · Draggable · Inertia · DrawSVG · CustomEase), Lenis smooth scroll and Motion.

## Run it

```bash
npm install
npm run dev      # starts Vite on http://localhost:5173 and opens the browser
npm run build    # production build → dist/
npm run preview  # serve the production build
```

## What's inside

| Section | Technique |
| --- | --- |
| Preloader | Logo lockup reveal, live counter, five-column curtain wipe |
| Hero | Three.js "nexus" globe (point-cloud sphere, graticule, pulsing route arcs, ambient dust), masked line entrance, mouse parallax, scroll fade |
| Immersive zoom | Framed photo expands to full viewport (proxy-driven `clip-path`), image zoom, manifesto text fills word-by-word on scroll |
| Marquee | Infinite loop whose speed/direction/skew react to Lenis scroll velocity |
| Services | Cursor-following hover-reveal image, row invert, freight type hand-off to the quote form |
| Inside every load | Three.js **exploded shipping container** driven by scroll, with projected HTML labels and a synced info list |
| The journey | Pinned **horizontal parallax storytelling** — multi-speed layers (`containerAnimation`), progress rail, vertical fallback on mobile |
| Process | Sticky **stacking cards** that scale back and dim as the next slides over (layer transformation) |
| Network | **Animated US lane map** — 20 hubs and 29 lanes on a real Albers projection; lanes draw in on scroll, freight pulses run the corridors, hovering a hub isolates its lanes |
| Why Freight Nexus | **3D tilt cards** with pointer-tracking glare |
| Client stories | **3D cylindrical slider** — drag with inertia, arrows, dots, autoplay, keyboard |
| FAQ | Animated `<details>` accordion |
| Quote form | Segmented pill control, floating labels, validation micro-interactions, DrawSVG success state |
| Everywhere | Custom cursor with contextual labels, magnetic buttons, masked heading reveals, batched fade-ups, velocity skew |

## Structure

```
index.html              page markup (all sections)
public/images/          photography (Unsplash, free to use)
src/main.js             boot sequence
src/styles/             base.css (tokens) · components.css · sections.css
src/js/core.js          GSAP plugins + Lenis wiring
src/js/hero-scene.js    Three.js globe
src/js/explode-scene.js Three.js exploded container
src/js/network-map.js   animated US lane map
src/js/us-map-data.js   generated map geometry (see Network map below)
src/js/*.js             one module per feature
```

## Brand

Navy + aqua, sampled from the logo and the brand reference:

| Role | Token | Hex |
| --- | --- | --- |
| Deepest ground | `--navy-950` | `#00102a` |
| Primary dark / ink | `--navy-900` | `#001838` (the logo's own navy) |
| Raised dark surface | `--navy-800` | `#002347` |
| Accent (aqua) | `--accent` → `--cyan-300` | `#74d8d4` |
| Accent on light | `--accent-ink` → `--cyan-700` | `#0b6c69` |
| Brand blue (logo, structural) | `--blue-500` | `#1479e0` |
| Page paper | `--ice-100` | `#eaf0fc` |

Type: **Fraunces** (variable serif display, with `SOFT`/`WONK`/`opsz` axes tuned
per level) · **Inter Tight** (body) · **DM Mono** (labels).

### Logo assets — `public/brand/`

The logo is used exactly as supplied — the asset files are unmodified and sit
on a transparent background. Because the site ground is navy and the mark is
navy + blue, `.logo-lockup` renders it with a CSS brightness lift and a faint
aqua glow so the dark half reads. Nothing is recoloured: the original
navy → blue relationship is preserved, and the same files drop straight onto a
light background unchanged.

| File | Use |
| --- | --- |
| `logo-mark.*` | the mark, in the nav / footer / preloader plate |
| `logo-wordmark.*` | the wordmark beside it |
| `logo-full.*` | stacked lockup |
| `icon-16/32/48.png` | browser tab icons (transparent) |
| `icon-180.png` | apple-touch-icon (opaque navy — iOS composites transparency onto black) |
| `icon-512.png` | large icon / PWA |
| `og-card.jpg` | social share card |

`.webp` is served with a `.png` fallback via `<picture>`.

## Photography

US-only subjects. Everything is either Unsplash-licensed or permissively
licensed with credit given in the footer:

| Image | Source | Licence |
| --- | --- | --- |
| `freight-train.jpg` — J.B. Hunt intermodal on BNSF | Wikideas1 | CC0 |
| `rail-loop.jpg` — Tehachapi Loop | David Brossard | CC BY-SA 2.0 |
| `truck-reefer.jpg` — May Trucking Freightliner | Ewkada | CC BY 4.0 |
| everything else | Unsplash | Unsplash License |

Each photo ships as WebP with a JPEG fallback, capped at ~2x its largest
on-screen size (2.3 MB of WebP across the whole page, nearly all lazy-loaded).

## Network map

`src/js/us-map-data.js` is generated: the US Census cartographic boundaries
(via `us-atlas`, public domain) projected with an Albers equal-area conic — the
standard US projection — then simplified to ~42 KB of path data. The lanes draw
in on scroll, freight pulses run the corridors with a pure-CSS dash animation
(no per-frame JS), and hovering a hub isolates everything that touches it.
