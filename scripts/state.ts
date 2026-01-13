import { ASCII_PRESETS } from './ascii';

const STORAGE_KEY = 'ascii-raymarcher-state';
const PRESETS_KEY = 'ascii-raymarcher-presets';

export interface AppState {
  shape: string; size: number; rotX: number; rotY: number; rotZ: number; autoSpin: boolean; autoSpinAxis: string; spinSpeed: number;
  ambient: number; diffuse: number; specular: number; shininess: number; shadows: boolean; shadowK: number; ao: boolean; aoStrength: number;
  noiseEnabled: boolean; noiseAmt: number; noiseScale: number; noiseSpeed: number; noiseOct: number;
  asciiPreset: string; asciiChars: string; invert: boolean; colorEnabled: boolean; gamma: number; colorMode: string; palette: string;
  fontSize: number; resScale: number; maxSteps: number; maxDist: number; taa: boolean; taaAmt: number; adaptive: boolean; targetFps: number;
  camDist: number; camYaw: number; camPitch: number;
  // Recording
  recordDuration: number; // seconds
  recordFps: number;
  recordResolution: string; // 'canvas' | '1280x720' | '1920x1080' | 'custom'
  recordWidth: number;
  recordHeight: number;
  [k:string]: any; // allow dynamic
} 

export const defaultState: AppState = {
  shape: 'Torus', size: 1.1, rotX: 20, rotY: 35, rotZ: 0, autoSpin: true, autoSpinAxis: 'X', spinSpeed: 2.0,
  ambient: 0.25, diffuse: 1.05, specular: 0.5, shininess: 32, shadows: true, shadowK: 12, ao: true, aoStrength: 0.9,
  noiseEnabled: false, noiseAmt: 0.16, noiseScale: 2.0, noiseSpeed: 0.9, noiseOct: 3,
  asciiPreset: 'dense', asciiChars: ASCII_PRESETS.dense, invert: false, colorEnabled: true, gamma: 1.0, colorMode: 'luma', palette: 'viridis',
  fontSize: 14, resScale: 1.0, maxSteps: 72, maxDist: 24, taa: true, taaAmt: 0.6, adaptive: false, targetFps: 50,
  camDist: 6.0, camYaw: 0, camPitch: 0,
  // Recording defaults
  recordDuration: 5, // seconds
  recordFps: 30,
  recordResolution: 'canvas',
  recordWidth: 1280,
  recordHeight: 720,
};

export interface Preset {
  name: string;
  state: Partial<AppState>;
}

export const presets: Preset[] = (() => {
  if (typeof window === 'undefined') return [];

  // Default presets
  const defaultPresets: Preset[] = [
    {
      name: "Classic ASCII",
      state: {
        shape: 'Torus', size: 1.1, rotX: 20, rotY: 35, rotZ: 0, autoSpin: true, autoSpinAxis: 'X', spinSpeed: 2.0,
        ambient: 0.25, diffuse: 1.05, specular: 0.5, shininess: 32, shadows: true, shadowK: 12, ao: true, aoStrength: 0.9,
        noiseEnabled: false, noiseAmt: 0.16, noiseScale: 2.0, noiseSpeed: 0.9, noiseOct: 3,
        asciiPreset: 'dense', asciiChars: ASCII_PRESETS.dense, invert: false, colorEnabled: true, gamma: 1.0, colorMode: 'luma', palette: 'grayscale',
        fontSize: 14, resScale: 1.0, maxSteps: 72, maxDist: 24, taa: true, taaAmt: 0.6, adaptive: false, targetFps: 50,
        camDist: 6.0,
        recordDuration: 5, recordFps: 30, recordResolution: 'canvas', recordWidth: 1280, recordHeight: 720,
      }
    },
    {
      name: "Neon Glow",
      state: {
        shape: 'Sphere', size: 1.0, rotX: 0, rotY: 0, rotZ: 0, autoSpin: true, autoSpinAxis: 'Y', spinSpeed: 1.5,
        ambient: 0.1, diffuse: 0.8, specular: 2.0, shininess: 64, shadows: false, shadowK: 12, ao: false, aoStrength: 0.9,
        noiseEnabled: false, noiseAmt: 0.16, noiseScale: 2.0, noiseSpeed: 0.9, noiseOct: 3,
        asciiPreset: 'blocks', asciiChars: ASCII_PRESETS.blocks, invert: false, colorEnabled: true, gamma: 1.2, colorMode: 'specular', palette: 'rainbow',
        fontSize: 16, resScale: 1.0, maxSteps: 72, maxDist: 24, taa: true, taaAmt: 0.8, adaptive: false, targetFps: 50,
        camDist: 5.0,
        recordDuration: 5, recordFps: 30, recordResolution: 'canvas', recordWidth: 1280, recordHeight: 720,
      }
    },
    {
      name: "Noisy Terrain",
      state: {
        shape: 'Plane', size: 2.0, rotX: 90, rotY: 0, rotZ: 0, autoSpin: false, autoSpinAxis: 'X', spinSpeed: 2.0,
        ambient: 0.3, diffuse: 1.2, specular: 0.3, shininess: 16, shadows: true, shadowK: 8, ao: true, aoStrength: 1.0,
        noiseEnabled: true, noiseAmt: 0.4, noiseScale: 1.5, noiseSpeed: 0.5, noiseOct: 4,
        asciiPreset: 'dots', asciiChars: ASCII_PRESETS.dots, invert: false, colorEnabled: true, gamma: 0.9, colorMode: 'depth', palette: 'viridis',
        fontSize: 12, resScale: 1.2, maxSteps: 100, maxDist: 32, taa: true, taaAmt: 0.5, adaptive: false, targetFps: 50,
        camDist: 8.0,
        recordDuration: 5, recordFps: 30, recordResolution: 'canvas', recordWidth: 1280, recordHeight: 720,
      }
    },
    {
      name: "Minimalist",
      state: {
        shape: 'Box', size: 1.2, rotX: 15, rotY: 45, rotZ: 0, autoSpin: false, autoSpinAxis: 'X', spinSpeed: 2.0,
        ambient: 0.5, diffuse: 0.8, specular: 0.0, shininess: 32, shadows: false, shadowK: 12, ao: false, aoStrength: 0.9,
        noiseEnabled: false, noiseAmt: 0.16, noiseScale: 2.0, noiseSpeed: 0.9, noiseOct: 3,
        asciiPreset: 'sparse', asciiChars: ASCII_PRESETS.sparse, invert: true, colorEnabled: false, gamma: 1.0, colorMode: 'luma', palette: 'grayscale',
        fontSize: 18, resScale: 0.8, maxSteps: 50, maxDist: 20, taa: false, taaAmt: 0.6, adaptive: false, targetFps: 50,
        camDist: 7.0,
        recordDuration: 5, recordFps: 30, recordResolution: 'canvas', recordWidth: 1280, recordHeight: 720,
      }
    },
    {
      name: "Retro Gaming",
      state: {
        shape: 'Octahedron', size: 1.0, rotX: 30, rotY: 60, rotZ: 15, autoSpin: true, autoSpinAxis: 'Z', spinSpeed: 3.0,
        ambient: 0.2, diffuse: 1.0, specular: 0.8, shininess: 8, shadows: true, shadowK: 16, ao: true, aoStrength: 0.7,
        noiseEnabled: false, noiseAmt: 0.16, noiseScale: 2.0, noiseSpeed: 0.9, noiseOct: 3,
        asciiPreset: 'blocky', asciiChars: ASCII_PRESETS.blocky, invert: false, colorEnabled: true, gamma: 1.1, colorMode: 'normal', palette: 'gameboy',
        fontSize: 14, resScale: 1.0, maxSteps: 80, maxDist: 28, taa: true, taaAmt: 0.7, adaptive: false, targetFps: 50,
        camDist: 6.5,
        recordDuration: 5, recordFps: 30, recordResolution: 'canvas', recordWidth: 1280, recordHeight: 720,
      }
    },
    {
      name: "Fire & Ice",
      state: {
        shape: 'Capsule', size: 1.5, rotX: 45, rotY: 90, rotZ: 0, autoSpin: true, autoSpinAxis: 'X', spinSpeed: 1.0,
        ambient: 0.15, diffuse: 1.3, specular: 1.5, shininess: 128, shadows: true, shadowK: 10, ao: true, aoStrength: 0.8,
        noiseEnabled: true, noiseAmt: 0.25, noiseScale: 3.0, noiseSpeed: 1.2, noiseOct: 3,
        asciiPreset: 'line', asciiChars: ASCII_PRESETS.line, invert: false, colorEnabled: true, gamma: 1.3, colorMode: 'hue', palette: 'fire',
        fontSize: 16, resScale: 1.1, maxSteps: 90, maxDist: 30, taa: true, taaAmt: 0.9, adaptive: false, targetFps: 50,
        camDist: 5.5,
        recordDuration: 5, recordFps: 30, recordResolution: 'canvas', recordWidth: 1280, recordHeight: 720,
      }
    },
    {
      name: "Cyberpunk",
      state: {
        shape: 'Heart', size: 1.0, rotX: 0, rotY: 0, rotZ: 0, autoSpin: true, autoSpinAxis: 'Y', spinSpeed: 0.8,
        ambient: 0.05, diffuse: 0.9, specular: 3.0, shininess: 256, shadows: true, shadowK: 20, ao: true, aoStrength: 0.6,
        noiseEnabled: true, noiseAmt: 0.15, noiseScale: 4.0, noiseSpeed: 2.0, noiseOct: 2,
        asciiPreset: 'binary', asciiChars: ASCII_PRESETS.binary, invert: false, colorEnabled: true, gamma: 1.4, colorMode: 'specular', palette: 'rainbow',
        fontSize: 12, resScale: 1.0, maxSteps: 120, maxDist: 40, taa: true, taaAmt: 0.95, adaptive: false, targetFps: 50,
        camDist: 6.0,
        recordDuration: 5, recordFps: 30, recordResolution: 'canvas', recordWidth: 1280, recordHeight: 720,
      }
    },
    {
      name: "Ocean Waves",
      state: {
        shape: 'Plane', size: 3.0, rotX: 75, rotY: 0, rotZ: 0, autoSpin: false, autoSpinAxis: 'X', spinSpeed: 2.0,
        ambient: 0.4, diffuse: 1.1, specular: 0.4, shininess: 24, shadows: true, shadowK: 6, ao: true, aoStrength: 0.9,
        noiseEnabled: true, noiseAmt: 0.6, noiseScale: 1.0, noiseSpeed: 0.3, noiseOct: 5,
        asciiPreset: 'dots', asciiChars: ASCII_PRESETS.dots, invert: false, colorEnabled: true, gamma: 0.8, colorMode: 'depth', palette: 'ice',
        fontSize: 10, resScale: 1.5, maxSteps: 150, maxDist: 50, taa: true, taaAmt: 0.4, adaptive: false, targetFps: 50,
        camDist: 10.0,
        recordDuration: 5, recordFps: 30, recordResolution: 'canvas', recordWidth: 1280, recordHeight: 720,
      }
    },
    {
      name: "Crystal Prism",
      state: {
        shape: 'Tetrahedron', size: 1.3, rotX: 25, rotY: 35, rotZ: 10, autoSpin: true, autoSpinAxis: 'Y', spinSpeed: 1.2,
        ambient: 0.2, diffuse: 0.7, specular: 2.5, shininess: 512, shadows: false, shadowK: 12, ao: false, aoStrength: 0.9,
        noiseEnabled: false, noiseAmt: 0.16, noiseScale: 2.0, noiseSpeed: 0.9, noiseOct: 3,
        asciiPreset: 'retro', asciiChars: ASCII_PRESETS.retro, invert: false, colorEnabled: true, gamma: 1.5, colorMode: 'normal', palette: 'rainbow',
        fontSize: 14, resScale: 0.9, maxSteps: 100, maxDist: 35, taa: true, taaAmt: 0.8, adaptive: false, targetFps: 50,
        camDist: 7.0,
        recordDuration: 5, recordFps: 30, recordResolution: 'canvas', recordWidth: 1280, recordHeight: 720,
      }
    },
    {
      name: "Volcanic",
      state: {
        shape: 'Cone', size: 1.8, rotX: 15, rotY: 45, rotZ: 0, autoSpin: true, autoSpinAxis: 'X', spinSpeed: 0.5,
        ambient: 0.1, diffuse: 1.4, specular: 0.6, shininess: 16, shadows: true, shadowK: 8, ao: true, aoStrength: 1.2,
        noiseEnabled: true, noiseAmt: 0.5, noiseScale: 2.5, noiseSpeed: 0.8, noiseOct: 4,
        asciiPreset: 'blocks', asciiChars: ASCII_PRESETS.blocks, invert: false, colorEnabled: true, gamma: 0.7, colorMode: 'luma', palette: 'fire',
        fontSize: 16, resScale: 1.2, maxSteps: 110, maxDist: 38, taa: true, taaAmt: 0.6, adaptive: false, targetFps: 50,
        camDist: 8.0,
        recordDuration: 5, recordFps: 30, recordResolution: 'canvas', recordWidth: 1280, recordHeight: 720,
      }
    },
    {
      name: "Matrix Code",
      state: {
        shape: 'Box', size: 1.0, rotX: 0, rotY: 0, rotZ: 0, autoSpin: false, autoSpinAxis: 'X', spinSpeed: 2.0,
        ambient: 0.0, diffuse: 0.0, specular: 0.0, shininess: 32, shadows: false, shadowK: 12, ao: false, aoStrength: 0.9,
        noiseEnabled: false, noiseAmt: 0.16, noiseScale: 2.0, noiseSpeed: 0.9, noiseOct: 3,
        asciiPreset: 'binary', asciiChars: ASCII_PRESETS.binary, invert: true, colorEnabled: true, gamma: 1.0, colorMode: 'luma', palette: 'gameboy',
        fontSize: 12, resScale: 1.0, maxSteps: 60, maxDist: 22, taa: false, taaAmt: 0.6, adaptive: false, targetFps: 50,
        camDist: 6.0,
        recordDuration: 5, recordFps: 30, recordResolution: 'canvas', recordWidth: 1280, recordHeight: 720,
      }
    },
    {
      name: "Sunset Horizon",
      state: {
        shape: 'Ellipsoid', size: 1.4, rotX: 20, rotY: 30, rotZ: 0, autoSpin: true, autoSpinAxis: 'Z', spinSpeed: 0.3,
        ambient: 0.3, diffuse: 1.2, specular: 1.8, shininess: 64, shadows: true, shadowK: 14, ao: true, aoStrength: 0.7,
        noiseEnabled: false, noiseAmt: 0.16, noiseScale: 2.0, noiseSpeed: 0.9, noiseOct: 3,
        asciiPreset: 'classic', asciiChars: ASCII_PRESETS.classic, invert: false, colorEnabled: true, gamma: 1.1, colorMode: 'hue', palette: 'fire',
        fontSize: 18, resScale: 0.8, maxSteps: 85, maxDist: 28, taa: true, taaAmt: 0.7, adaptive: false, targetFps: 50,
        camDist: 6.5,
        recordDuration: 5, recordFps: 30, recordResolution: 'canvas', recordWidth: 1280, recordHeight: 720,
      }
    },
    {
      name: "High Quality",
      state: {
        shape: 'Star', size: 1.2, rotX: 30, rotY: 60, rotZ: 0, autoSpin: true, autoSpinAxis: 'Y', spinSpeed: 1.5,
        ambient: 0.25, diffuse: 1.0, specular: 1.0, shininess: 64, shadows: true, shadowK: 16, ao: true, aoStrength: 0.9,
        noiseEnabled: false, noiseAmt: 0.16, noiseScale: 2.0, noiseSpeed: 0.9, noiseOct: 3,
        asciiPreset: 'dense', asciiChars: ASCII_PRESETS.dense, invert: false, colorEnabled: true, gamma: 1.0, colorMode: 'depth', palette: 'viridis',
        fontSize: 8, resScale: 2.0, maxSteps: 200, maxDist: 60, taa: true, taaAmt: 0.8, adaptive: false, targetFps: 30,
        camDist: 6.0,
        recordDuration: 5, recordFps: 30, recordResolution: 'canvas', recordWidth: 1280, recordHeight: 720,
      }
    },
    {
      name: "Fast & Low",
      state: {
        shape: 'Sphere', size: 1.0, rotX: 0, rotY: 0, rotZ: 0, autoSpin: true, autoSpinAxis: 'X', spinSpeed: 4.0,
        ambient: 0.3, diffuse: 1.0, specular: 0.5, shininess: 32, shadows: false, shadowK: 12, ao: false, aoStrength: 0.9,
        noiseEnabled: false, noiseAmt: 0.16, noiseScale: 2.0, noiseSpeed: 0.9, noiseOct: 3,
        asciiPreset: 'sparse', asciiChars: ASCII_PRESETS.sparse, invert: false, colorEnabled: false, gamma: 1.0, colorMode: 'luma', palette: 'grayscale',
        fontSize: 20, resScale: 0.5, maxSteps: 32, maxDist: 16, taa: false, taaAmt: 0.6, adaptive: true, targetFps: 60,
        camDist: 6.0,
        recordDuration: 5, recordFps: 30, recordResolution: 'canvas', recordWidth: 1280, recordHeight: 720,
      }
    }
  ];

  // Load saved presets and merge with defaults
  try {
    const saved = localStorage.getItem(PRESETS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Merge saved presets with defaults, avoiding duplicates by name
        const merged = [...defaultPresets];
        for (const preset of parsed) {
          if (preset.name && preset.state && !merged.find(p => p.name === preset.name)) {
            merged.push(preset);
          }
        }
        // Save merged presets back to localStorage
        localStorage.setItem(PRESETS_KEY, JSON.stringify(merged));
        return merged;
      }
    }
  } catch {}

  // Save defaults to localStorage
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(defaultPresets));
  } catch {}

  return defaultPresets;
})();

export function savePreset(name: string) {
  const presetState: Partial<AppState> = {};
  for (const key in state) {
    if (key !== 'camYaw' && key !== 'camPitch') { // exclude camera position for presets
      (presetState as any)[key] = (state as any)[key];
    }
  }
  const existingIndex = presets.findIndex(p => p.name === name);
  if (existingIndex >= 0) {
    presets[existingIndex].state = presetState;
  } else {
    presets.push({ name, state: presetState });
  }
  savePresetsToStorage();
}

export function loadPreset(name: string) {
  const preset = presets.find(p => p.name === name);
  if (preset) {
    Object.assign(state, preset.state);
    saveStateThrottled();
  }
}

export function deletePreset(name: string) {
  const index = presets.findIndex(p => p.name === name);
  if (index >= 0) {
    presets.splice(index, 1);
    savePresetsToStorage();
  }
}

export function exportPresets(): string {
  return JSON.stringify(presets, null, 2);
}

export function importPresets(json: string) {
  try {
    const imported = JSON.parse(json);
    if (Array.isArray(imported)) {
      presets.length = 0;
      presets.push(...imported.filter(p => p.name && p.state));
      savePresetsToStorage();
      return true;
    }
  } catch {}
  return false;
}

export function resetPresetsToDefaults() {
  const defaultPresets: Preset[] = [
    {
      name: "Classic ASCII",
      state: {
        shape: 'Torus', size: 1.1, rotX: 20, rotY: 35, rotZ: 0, autoSpin: true, autoSpinAxis: 'X', spinSpeed: 2.0,
        ambient: 0.25, diffuse: 1.05, specular: 0.5, shininess: 32, shadows: true, shadowK: 12, ao: true, aoStrength: 0.9,
        noiseEnabled: false, noiseAmt: 0.16, noiseScale: 2.0, noiseSpeed: 0.9, noiseOct: 3,
        asciiPreset: 'dense', asciiChars: ASCII_PRESETS.dense, invert: false, colorEnabled: true, gamma: 1.0, colorMode: 'luma', palette: 'grayscale',
        fontSize: 14, resScale: 1.0, maxSteps: 72, maxDist: 24, taa: true, taaAmt: 0.6, adaptive: false, targetFps: 50,
        camDist: 6.0,
        recordDuration: 5, recordFps: 30, recordResolution: 'canvas', recordWidth: 1280, recordHeight: 720,
      }
    },
    {
      name: "Neon Glow",
      state: {
        shape: 'Sphere', size: 1.0, rotX: 0, rotY: 0, rotZ: 0, autoSpin: true, autoSpinAxis: 'Y', spinSpeed: 1.5,
        ambient: 0.1, diffuse: 0.8, specular: 2.0, shininess: 64, shadows: false, shadowK: 12, ao: false, aoStrength: 0.9,
        noiseEnabled: false, noiseAmt: 0.16, noiseScale: 2.0, noiseSpeed: 0.9, noiseOct: 3,
        asciiPreset: 'blocks', asciiChars: ASCII_PRESETS.blocks, invert: false, colorEnabled: true, gamma: 1.2, colorMode: 'specular', palette: 'rainbow',
        fontSize: 16, resScale: 1.0, maxSteps: 72, maxDist: 24, taa: true, taaAmt: 0.8, adaptive: false, targetFps: 50,
        camDist: 5.0,
        recordDuration: 5, recordFps: 30, recordResolution: 'canvas', recordWidth: 1280, recordHeight: 720,
      }
    },
    {
      name: "Noisy Terrain",
      state: {
        shape: 'Plane', size: 2.0, rotX: 90, rotY: 0, rotZ: 0, autoSpin: false, autoSpinAxis: 'X', spinSpeed: 2.0,
        ambient: 0.3, diffuse: 1.2, specular: 0.3, shininess: 16, shadows: true, shadowK: 8, ao: true, aoStrength: 1.0,
        noiseEnabled: true, noiseAmt: 0.4, noiseScale: 1.5, noiseSpeed: 0.5, noiseOct: 4,
        asciiPreset: 'dots', asciiChars: ASCII_PRESETS.dots, invert: false, colorEnabled: true, gamma: 0.9, colorMode: 'depth', palette: 'viridis',
        fontSize: 12, resScale: 1.2, maxSteps: 100, maxDist: 32, taa: true, taaAmt: 0.5, adaptive: false, targetFps: 50,
        camDist: 8.0,
        recordDuration: 5, recordFps: 30, recordResolution: 'canvas', recordWidth: 1280, recordHeight: 720,
      }
    },
    {
      name: "Minimalist",
      state: {
        shape: 'Box', size: 1.2, rotX: 15, rotY: 45, rotZ: 0, autoSpin: false, autoSpinAxis: 'X', spinSpeed: 2.0,
        ambient: 0.5, diffuse: 0.8, specular: 0.0, shininess: 32, shadows: false, shadowK: 12, ao: false, aoStrength: 0.9,
        noiseEnabled: false, noiseAmt: 0.16, noiseScale: 2.0, noiseSpeed: 0.9, noiseOct: 3,
        asciiPreset: 'sparse', asciiChars: ASCII_PRESETS.sparse, invert: true, colorEnabled: false, gamma: 1.0, colorMode: 'luma', palette: 'grayscale',
        fontSize: 18, resScale: 0.8, maxSteps: 50, maxDist: 20, taa: false, taaAmt: 0.6, adaptive: false, targetFps: 50,
        camDist: 7.0,
        recordDuration: 5, recordFps: 30, recordResolution: 'canvas', recordWidth: 1280, recordHeight: 720,
      }
    },
    {
      name: "Retro Gaming",
      state: {
        shape: 'Octahedron', size: 1.0, rotX: 30, rotY: 60, rotZ: 15, autoSpin: true, autoSpinAxis: 'Z', spinSpeed: 3.0,
        ambient: 0.2, diffuse: 1.0, specular: 0.8, shininess: 8, shadows: true, shadowK: 16, ao: true, aoStrength: 0.7,
        noiseEnabled: false, noiseAmt: 0.16, noiseScale: 2.0, noiseSpeed: 0.9, noiseOct: 3,
        asciiPreset: 'blocky', asciiChars: ASCII_PRESETS.blocky, invert: false, colorEnabled: true, gamma: 1.1, colorMode: 'normal', palette: 'gameboy',
        fontSize: 14, resScale: 1.0, maxSteps: 80, maxDist: 28, taa: true, taaAmt: 0.7, adaptive: false, targetFps: 50,
        camDist: 6.5,
        recordDuration: 5, recordFps: 30, recordResolution: 'canvas', recordWidth: 1280, recordHeight: 720,
      }
    },
    {
      name: "Fire & Ice",
      state: {
        shape: 'Capsule', size: 1.5, rotX: 45, rotY: 90, rotZ: 0, autoSpin: true, autoSpinAxis: 'X', spinSpeed: 1.0,
        ambient: 0.15, diffuse: 1.3, specular: 1.5, shininess: 128, shadows: true, shadowK: 10, ao: true, aoStrength: 0.8,
        noiseEnabled: true, noiseAmt: 0.25, noiseScale: 3.0, noiseSpeed: 1.2, noiseOct: 3,
        asciiPreset: 'line', asciiChars: ASCII_PRESETS.line, invert: false, colorEnabled: true, gamma: 1.3, colorMode: 'hue', palette: 'fire',
        fontSize: 16, resScale: 1.1, maxSteps: 90, maxDist: 30, taa: true, taaAmt: 0.9, adaptive: false, targetFps: 50,
        camDist: 5.5,
        recordDuration: 5, recordFps: 30, recordResolution: 'canvas', recordWidth: 1280, recordHeight: 720,
      }
    },
    {
      name: "Cyberpunk",
      state: {
        shape: 'Heart', size: 1.0, rotX: 0, rotY: 0, rotZ: 0, autoSpin: true, autoSpinAxis: 'Y', spinSpeed: 0.8,
        ambient: 0.05, diffuse: 0.9, specular: 3.0, shininess: 256, shadows: true, shadowK: 20, ao: true, aoStrength: 0.6,
        noiseEnabled: true, noiseAmt: 0.15, noiseScale: 4.0, noiseSpeed: 2.0, noiseOct: 2,
        asciiPreset: 'binary', asciiChars: ASCII_PRESETS.binary, invert: false, colorEnabled: true, gamma: 1.4, colorMode: 'specular', palette: 'rainbow',
        fontSize: 12, resScale: 1.0, maxSteps: 120, maxDist: 40, taa: true, taaAmt: 0.95, adaptive: false, targetFps: 50,
        camDist: 6.0,
        recordDuration: 5, recordFps: 30, recordResolution: 'canvas', recordWidth: 1280, recordHeight: 720,
      }
    },
    {
      name: "Ocean Waves",
      state: {
        shape: 'Plane', size: 3.0, rotX: 75, rotY: 0, rotZ: 0, autoSpin: false, autoSpinAxis: 'X', spinSpeed: 2.0,
        ambient: 0.4, diffuse: 1.1, specular: 0.4, shininess: 24, shadows: true, shadowK: 6, ao: true, aoStrength: 0.9,
        noiseEnabled: true, noiseAmt: 0.6, noiseScale: 1.0, noiseSpeed: 0.3, noiseOct: 5,
        asciiPreset: 'dots', asciiChars: ASCII_PRESETS.dots, invert: false, colorEnabled: true, gamma: 0.8, colorMode: 'depth', palette: 'ice',
        fontSize: 10, resScale: 1.5, maxSteps: 150, maxDist: 50, taa: true, taaAmt: 0.4, adaptive: false, targetFps: 50,
        camDist: 10.0,
        recordDuration: 5, recordFps: 30, recordResolution: 'canvas', recordWidth: 1280, recordHeight: 720,
      }
    },
    {
      name: "Crystal Prism",
      state: {
        shape: 'Tetrahedron', size: 1.3, rotX: 25, rotY: 35, rotZ: 10, autoSpin: true, autoSpinAxis: 'Y', spinSpeed: 1.2,
        ambient: 0.2, diffuse: 0.7, specular: 2.5, shininess: 512, shadows: false, shadowK: 12, ao: false, aoStrength: 0.9,
        noiseEnabled: false, noiseAmt: 0.16, noiseScale: 2.0, noiseSpeed: 0.9, noiseOct: 3,
        asciiPreset: 'retro', asciiChars: ASCII_PRESETS.retro, invert: false, colorEnabled: true, gamma: 1.5, colorMode: 'normal', palette: 'rainbow',
        fontSize: 14, resScale: 0.9, maxSteps: 100, maxDist: 35, taa: true, taaAmt: 0.8, adaptive: false, targetFps: 50,
        camDist: 7.0,
        recordDuration: 5, recordFps: 30, recordResolution: 'canvas', recordWidth: 1280, recordHeight: 720,
      }
    },
    {
      name: "Volcanic",
      state: {
        shape: 'Cone', size: 1.8, rotX: 15, rotY: 45, rotZ: 0, autoSpin: true, autoSpinAxis: 'X', spinSpeed: 0.5,
        ambient: 0.1, diffuse: 1.4, specular: 0.6, shininess: 16, shadows: true, shadowK: 8, ao: true, aoStrength: 1.2,
        noiseEnabled: true, noiseAmt: 0.5, noiseScale: 2.5, noiseSpeed: 0.8, noiseOct: 4,
        asciiPreset: 'blocks', asciiChars: ASCII_PRESETS.blocks, invert: false, colorEnabled: true, gamma: 0.7, colorMode: 'luma', palette: 'fire',
        fontSize: 16, resScale: 1.2, maxSteps: 110, maxDist: 38, taa: true, taaAmt: 0.6, adaptive: false, targetFps: 50,
        camDist: 8.0,
        recordDuration: 5, recordFps: 30, recordResolution: 'canvas', recordWidth: 1280, recordHeight: 720,
      }
    },
    {
      name: "Matrix Code",
      state: {
        shape: 'Box', size: 1.0, rotX: 0, rotY: 0, rotZ: 0, autoSpin: false, autoSpinAxis: 'X', spinSpeed: 2.0,
        ambient: 0.0, diffuse: 0.0, specular: 0.0, shininess: 32, shadows: false, shadowK: 12, ao: false, aoStrength: 0.9,
        noiseEnabled: false, noiseAmt: 0.16, noiseScale: 2.0, noiseSpeed: 0.9, noiseOct: 3,
        asciiPreset: 'binary', asciiChars: ASCII_PRESETS.binary, invert: true, colorEnabled: true, gamma: 1.0, colorMode: 'luma', palette: 'gameboy',
        fontSize: 12, resScale: 1.0, maxSteps: 60, maxDist: 22, taa: false, taaAmt: 0.6, adaptive: false, targetFps: 50,
        camDist: 6.0,
        recordDuration: 5, recordFps: 30, recordResolution: 'canvas', recordWidth: 1280, recordHeight: 720,
      }
    },
    {
      name: "Sunset Horizon",
      state: {
        shape: 'Ellipsoid', size: 1.4, rotX: 20, rotY: 30, rotZ: 0, autoSpin: true, autoSpinAxis: 'Z', spinSpeed: 0.3,
        ambient: 0.3, diffuse: 1.2, specular: 1.8, shininess: 64, shadows: true, shadowK: 14, ao: true, aoStrength: 0.7,
        noiseEnabled: false, noiseAmt: 0.16, noiseScale: 2.0, noiseSpeed: 0.9, noiseOct: 3,
        asciiPreset: 'classic', asciiChars: ASCII_PRESETS.classic, invert: false, colorEnabled: true, gamma: 1.1, colorMode: 'hue', palette: 'fire',
        fontSize: 18, resScale: 0.8, maxSteps: 85, maxDist: 28, taa: true, taaAmt: 0.7, adaptive: false, targetFps: 50,
        camDist: 6.5,
        recordDuration: 5, recordFps: 30, recordResolution: 'canvas', recordWidth: 1280, recordHeight: 720,
      }
    },
    {
      name: "High Quality",
      state: {
        shape: 'Star', size: 1.2, rotX: 30, rotY: 60, rotZ: 0, autoSpin: true, autoSpinAxis: 'Y', spinSpeed: 1.5,
        ambient: 0.25, diffuse: 1.0, specular: 1.0, shininess: 64, shadows: true, shadowK: 16, ao: true, aoStrength: 0.9,
        noiseEnabled: false, noiseAmt: 0.16, noiseScale: 2.0, noiseSpeed: 0.9, noiseOct: 3,
        asciiPreset: 'dense', asciiChars: ASCII_PRESETS.dense, invert: false, colorEnabled: true, gamma: 1.0, colorMode: 'depth', palette: 'viridis',
        fontSize: 8, resScale: 2.0, maxSteps: 200, maxDist: 60, taa: true, taaAmt: 0.8, adaptive: false, targetFps: 30,
        camDist: 6.0,
        recordDuration: 5, recordFps: 30, recordResolution: 'canvas', recordWidth: 1280, recordHeight: 720,
      }
    },
    {
      name: "Fast & Low",
      state: {
        shape: 'Sphere', size: 1.0, rotX: 0, rotY: 0, rotZ: 0, autoSpin: true, autoSpinAxis: 'X', spinSpeed: 4.0,
        ambient: 0.3, diffuse: 1.0, specular: 0.5, shininess: 32, shadows: false, shadowK: 12, ao: false, aoStrength: 0.9,
        noiseEnabled: false, noiseAmt: 0.16, noiseScale: 2.0, noiseSpeed: 0.9, noiseOct: 3,
        asciiPreset: 'sparse', asciiChars: ASCII_PRESETS.sparse, invert: false, colorEnabled: false, gamma: 1.0, colorMode: 'luma', palette: 'grayscale',
        fontSize: 20, resScale: 0.5, maxSteps: 32, maxDist: 16, taa: false, taaAmt: 0.6, adaptive: true, targetFps: 60,
        camDist: 6.0,
        recordDuration: 5, recordFps: 30, recordResolution: 'canvas', recordWidth: 1280, recordHeight: 720,
      }
    }
  ];

  presets.length = 0;
  presets.push(...defaultPresets);
  savePresetsToStorage();
}

function savePresetsToStorage() {
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
  } catch {}
}

export const state: AppState = (() => {
  if (typeof window === 'undefined') return { ...defaultState };
  try{
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return saved ? {...defaultState, ...saved} : {...defaultState};
  }catch{
    return {...defaultState};
  }
})();

export interface Flags { needResize: boolean; needFontMetrics: boolean; }
export const flags: Flags = { needResize: true, needFontMetrics: true };

let saveTimeout: number | null = null;
export function saveStateThrottled(){
  if(saveTimeout) return;
  saveTimeout = window.setTimeout(()=>{
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch{}
    saveTimeout = null;
  }, 250);
}

export function resetAllState(){
  for(const k of Object.keys(defaultState)){
    (state as any)[k] = (defaultState as any)[k];
  }
}