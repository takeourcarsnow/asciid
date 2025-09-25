# ASCII Raymarcher
A fast, mobile-optimized webapp for interactive 3D raymarching rendered as ASCII art in the browser. Features real-time controls for shape, lighting, surface noise, color, and performance, all rendered in a canvas using JavaScript and SDFs (Signed Distance Functions).
## Features
- **Interactive 3D ASCII rendering**: Choose from multiple shapes (sphere, box, torus, etc.) and control their size, rotation, and animation.
- **Lighting controls**: Adjust ambient, diffuse, specular, shininess, shadows, and ambient occlusion.
- **Surface noise**: Add animated procedural noise to surfaces.
- **ASCII & color**: Select ASCII presets, custom characters, color modes, palettes, and gamma.
- **Performance tuning**: Adaptive resolution, temporal anti-aliasing, FPS target, and more.
- **Mobile-friendly UI**: Responsive layout, touch controls, and fullscreen support.
## Demo
Open `index.html` in your browser. No build step required.
## File Structure
- `index.html` – Main HTML entry point
- `styles.css` – Responsive, modern CSS for layout and controls
- `scripts/`
  - `main.js` – App entry, initializes UI, input, and renderer
  - `renderer.js` – Core ASCII raymarching renderer
  - `sdf.js` – Signed Distance Functions for 3D shapes
  - `ui.js`, `input.js`, `state.js` – UI, input, and state management
  - `noise.js`, `palettes.js`, `utils.js` – Noise, color palettes, and math utilities
## Usage
1. Clone or download this repo.
2. Open `index.html` in any modern browser (desktop or mobile).
3. Use the controls to explore different shapes, lighting, and effects.
## Controls
- **Mouse/touch**: Drag to orbit, pinch/wheel to zoom
- **Keyboard**: WASD, QE to move, R to reset
- **Panel**: Adjust all rendering and scene parameters
## Technologies
- Vanilla JavaScript (ES6 modules)
- HTML5 Canvas
- CSS3 (responsive, dark/light mode)
# ASCII Raymarcher (Next.js + TypeScript)

This project is a full migration of the original vanilla JS ASCII Raymarcher webapp to Next.js (App Router) with strict TypeScript. All former `.js` modules have been rewritten as `.ts` with appropriate types—not just renamed.

The UI, look, and runtime behavior remain functionally identical: real-time SDF ray marching drawn into a 2D canvas, adaptive resolution, temporal AA, ASCII palettes, lighting, surface noise, and responsive mobile controls.

## Getting Started

```bash
npm install
npm run dev
```
Visit: http://localhost:3000

Production build:
```bash
npm run build
npm start
```

## Structure

app/           Next.js App Router layout & page (client component)
app/globals.css  Ported global styles from original CSS
scripts/       All logic (renderer, SDFs, noise, palettes, math, UI binding, input, state)
public/        Static assets (add favicons / icons here)
package.json   Next.js + React dependencies
tsconfig.json  Strict TypeScript configuration

## Key Technical Changes

1. Strong typing for math helpers, SDF functions, noise, palettes, renderer, and state.
2. State persistence retained via `localStorage` under key `ascii-raymarcher-state` (guarded for SSR safety).
3. DOM imperative UI binding retained for performance; React is used only to mount static markup (avoids rewriting renderer logic into hooks unnecessarily).
4. All adaptive + TAA logic unchanged; canvas render loop still uses `requestAnimationFrame`.
5. Icons moved to `public/` (add actual files there; placeholder note included).

## Controls (unchanged)

Mouse / Touch: Drag to orbit, wheel or pinch to zoom
Keyboard: WASD rotate/pitch, Q/E zoom, R reset camera
Panel: Adjust shape, lighting, noise, ASCII, performance, color

## Future Enhancements (Optional)

- Dynamic import of heavy renderer code to reduce initial bundle.
- Palette preview thumbnails.
- Export current frame as text or PNG.
- User presets and shareable state URLs.

## License

Original content retained; this migration only restructures for Next.js + TypeScript.

Enjoy exploring high-performance ASCII raymarching! 
