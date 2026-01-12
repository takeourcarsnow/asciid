# ASCII Raymarcher (Next.js + TypeScript)

A mobile‑optimized ASCII raymarcher and SDF demo built with Next.js and TypeScript. It renders 3D signed distance fields (SDFs) to an HTML canvas and paints ASCII characters (optionally colored) for a stylized, low‑bandwidth visual effect. The app includes temporal anti‑aliasing (TAA), adaptive resolution for stable FPS on phones, and many runtime controls.

This README summarizes how to run the project locally, what the main source files do, available controls, and quick pointers for development and deployment.

## Key features
- SDF-based ray marching of many primitive shapes (sphere, torus, box, prism, heart, egg, ...)
- ASCII character rendering with color palettes and modes (luma, depth, normal, specular, momentum)
- New color palettes and presets (Gameboy, NES, Sega, Retro palettes; additional ASCII presets: sparse, line, blocky, retro)
- Temporal AA (TAA) and adaptive resolution to stabilize performance
- Mobile-optimized UI and touch controls (pinch to zoom, drag to orbit)
- Persistent settings stored to localStorage

## Requirements
- Node.js (LTS) — Node 18+ is recommended for modern Next.js versions
- npm (or yarn/pnpm) available in your shell

No server-side secrets or environment variables are required to run the demo locally.

## Quick start (local)

Open a terminal (PowerShell on Windows) in the project root and run:

```powershell
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

Production build and run:

```powershell
npm run build
npm run start
```

Type checking (TypeScript):

```powershell
npm run type-check
```

## Project structure (important files)

- `app/layout.tsx` — top-level HTML layout and metadata for the Next.js app.
- `app/page.tsx` — client page component which initializes the UI, input, and renderer.
- `public/` — static assets (favicons and icons). See `public/README_ASSETS.txt` for notes.
- `scripts/` — core demo code (all TypeScript modules used in the client):
  - `renderer.ts` — the main rendering loop, canvas setup, ASCII painting, TAA, adaptive resolution, and frame scheduling.
  - `ui.ts` — binds DOM controls to `state`, updates UI elements (FPS), and toggles fullscreen/panel.
  - `input.ts` — pointer and keyboard handling (orbit, pinch/wheel zoom, keyboard camera control).
  - `state.ts` — application state, defaults, and localStorage persistence.
  - `sdf.ts` — signed distance functions and scene mapping, normal, soft shadow and AO helpers.
  - `noise.ts` — noise helpers (value noise + FBM) used to perturb surfaces.
  - `palettes.ts` — color palettes used to tint ASCII characters.
  - `ascii.ts` — predefined ASCII presets.
  - `utils.ts` — math utilities (vectors, matrices, halton, bayer dither, etc.).

## Controls (in-app)
- Mouse / touch:
  - Drag: Orbit camera
  - Wheel / Pinch: Zoom
- Keyboard:
  - W / S: tilt up / down
  - A / D: yaw left / right
  - Q / E: zoom out / in
  - R: reset camera
- UI Panel: many scene, lighting, noise, ASCII, color, and performance controls. On small screens use the "Controls" button to open the panel.
- Recording: A new "Recording" section in the panel allows you to set duration, FPS, and resolution, and export a WebM video of the animation. Large resolutions may be memory and CPU intensive; browser support for `MediaRecorder` varies.

## Performance tuning tips
- `fontSize` and `resScale` (resolution scale) significantly affect GPU/CPU cost — lower values increase framerate on phones.
- `maxSteps` and `maxDist` control raymarch quality vs cost — increasing `maxSteps` yields crisper shadows/edges but costs more.
- Enable `adaptive` res and set `Target FPS` to let the demo automatically scale resolution for smooth playback.
- Turn off `colorEnabled` (monochrome ASCII) to reduce per-character coloring overhead.

## Development notes
- The app is a purely client-side demo. The rendering logic lives entirely under `scripts/` and is initialized in `app/page.tsx`.
- The renderer draws ASCII by measuring monospaced character metrics (`renderer.ts` → `updateFont`) and painting text rows to a 2D canvas. TAA uses a Halton jitter sequence and a small history buffer per character cell.
- State persistence is implemented in `state.ts` using `localStorage`. Use `resetAll` in the UI to return to defaults.
- If you add or change controls in the DOM, wire them in `ui.ts` using the `bind` helpers so they sync with `state`.

## Running tests / type checks
- This repository currently has no unit tests. Use the TypeScript check to catch type errors:

```powershell
npm run type-check
```

## Deployment
- This is a standard Next.js app — deploy on Vercel for the easiest experience, or build and serve with `npm run build` + `npm run start` on any Node host.

## Troubleshooting
- Blank canvas / no rendering: ensure `scripts/` files are loaded by the client (the page is marked `'use client'` in `app/page.tsx`) and open the browser console for errors.
- Very low FPS on phones: lower `fontSize`, set `resScale` < 1.0, reduce `maxSteps`, enable `adaptive` and lower `Target FPS`.
- Strange character alignment or clipping: try toggling `fontSize` or resizing the browser; the renderer recalculates font metrics and grid layout.

## Contributing
- Small changes, bug fixes, or performance improvements welcome. Please open an issue first if you plan a larger change.
- Add a license file (none is included by default) if you want to allow reuse.

## License
No license file is present in this repository. Add a `LICENSE` if you want to publish under an open license.

---

If you'd like, I can also:
- Add a minimal CI workflow for building the Next app on push.
- Add a small screenshot or GIF to the README (you can drop images into `public/`).
- Add a `LICENSE` template and a short `CONTRIBUTING.md`.

Completion summary:
- Created `README.md` with install/run instructions, file map, controls, performance tips and development notes.
