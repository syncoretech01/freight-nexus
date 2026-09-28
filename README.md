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
| Preloader | SplitText wordmark, live counter, five-column curtain wipe |
| Hero | Three.js "nexus" globe (point-cloud sphere, graticule, pulsing route arcs, ambient dust), masked line entrance, mouse parallax, scroll fade |
| Immersive zoom | Framed photo expands to full viewport (proxy-driven `clip-path`), image zoom, manifesto text fills word-by-word on scroll |
| Marquee | Infinite loop whose speed/direction/skew react to Lenis scroll velocity |
| Services | Cursor-following hover-reveal image, row invert, freight type hand-off to the quote form |
| Inside every load | Three.js **exploded shipping container** driven by scroll, with projected HTML labels and a synced info list |
| The journey | Pinned **horizontal parallax storytelling** — multi-speed layers (`containerAnimation`), progress rail, vertical fallback on mobile |
| Process | Sticky **stacking cards** that scale back and dim as the next slides over (layer transformation) |
| Network | **Vertical columns slider** — four columns moving in opposite directions at different speeds, plus Motion-powered counters |
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
src/js/*.js             one module per feature
```

## Brand

Colours are sampled directly from the Freight Nexus logo:

| Role | Token | Hex |
| --- | --- | --- |
| Deepest ground | `--navy-950` | `#04101f` |
| Primary dark / ink | `--navy-900` | `#071a35` |
| Raised dark surface | `--navy-800` | `#0b2749` |
| Brand blue (logo) | `--blue-500` | `#1479e0` |
| Accent on dark | `--blue-400` | `#4da3ff` |
| Tint / light surface | `--blue-100` | `#e0efff` |
| Page paper | `--ice-100` | `#eff4fb` |

Type: Instrument Serif (editorial display) · Manrope (body) · DM Mono (labels).

### Logo assets — `public/brand/`

| File | Use |
| --- | --- |
| `logo-mark-light.*` / `logo-wordmark-light.*` | nav, footer, preloader (on navy) |
| `logo-mark.*` / `logo-wordmark.*` | originals, for light backgrounds |
| `logo-full.*` / `logo-full-light.*` | stacked lockup |
| `icon-mark.png` | favicon fallback + apple-touch-icon |
| `og-card.jpg` | social share card |

The `-light` variants are recoloured from the master art: the navy half is mapped
onto a white→ice ramp that keeps its original shading, and the blue half stays
saturated, so the mark holds its two-tone identity on the dark ground.
`.webp` is served with a `.png` fallback via `<picture>`.
