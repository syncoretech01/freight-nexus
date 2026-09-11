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

## Palette

Deep teal `#0a2c2d / #0f3b3c`, dusty rose `#e8a6b2 / #d98a98`, cream `#f7f1ea / #fcf9f5` — sampled from the brand reference.
Type: Instrument Serif (display) · Manrope (body) · DM Mono (labels).
