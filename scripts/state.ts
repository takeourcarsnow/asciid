import { ASCII_PRESETS } from './ascii';

const STORAGE_KEY = 'ascii-raymarcher-state';

export interface AppState {
  shape: string; size: number; rotX: number; rotY: number; rotZ: number; autoSpin: boolean; spinSpeed: number;
  ambient: number; diffuse: number; specular: number; shininess: number; shadows: boolean; shadowK: number; ao: boolean; aoStrength: number;
  noiseEnabled: boolean; noiseAmt: number; noiseScale: number; noiseSpeed: number; noiseOct: number;
  asciiPreset: string; asciiChars: string; invert: boolean; colorEnabled: boolean; gamma: number; colorMode: string; palette: string;
  fontSize: number; resScale: number; maxSteps: number; maxDist: number; taa: boolean; taaAmt: number; adaptive: boolean; targetFps: number;
  camDist: number; camYaw: number; camPitch: number;
  [k:string]: any; // allow dynamic
}

export const defaultState: AppState = {
  shape: 'Torus', size: 1.1, rotX: 20, rotY: 35, rotZ: 0, autoSpin: true, spinSpeed: 0.6,
  ambient: 0.25, diffuse: 1.05, specular: 0.5, shininess: 32, shadows: true, shadowK: 12, ao: true, aoStrength: 0.9,
  noiseEnabled: false, noiseAmt: 0.16, noiseScale: 2.0, noiseSpeed: 0.9, noiseOct: 3,
  asciiPreset: 'dense', asciiChars: ASCII_PRESETS.dense, invert: false, colorEnabled: true, gamma: 1.0, colorMode: 'luma', palette: 'viridis',
  fontSize: 14, resScale: 1.0, maxSteps: 72, maxDist: 24, taa: true, taaAmt: 0.6, adaptive: true, targetFps: 50,
  camDist: 6.0, camYaw: 0, camPitch: 0,
};

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