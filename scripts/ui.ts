import { ASCII_PRESETS } from './ascii';
import { defaultState, state, flags, saveStateThrottled, resetAllState } from './state';

const $ = <T extends Element = HTMLElement>(sel:string)=> document.querySelector(sel) as T | null;

interface UIElements { canvas:HTMLCanvasElement|null; viewer:HTMLElement|null; fpsEl:HTMLElement|null; panel:HTMLElement|null; panelBtn:HTMLButtonElement|null; fullscreenBtn:HTMLButtonElement|null; mobilePanelToggle:HTMLButtonElement|null; mobileFullscreen:HTMLButtonElement|null; }
const elements: UIElements = { canvas: null, viewer: null, fpsEl: null, panel: null, panelBtn: null, fullscreenBtn: null, mobilePanelToggle: null, mobileFullscreen: null };

function toggleFullscreen(){
  const doc:any = document;
  const el:any = doc.documentElement;
  if(!doc.fullscreenElement && el.requestFullscreen){ el.requestFullscreen(); }
  else if(doc.exitFullscreen){ doc.exitFullscreen(); }
}
function togglePanel(open?:boolean){
  if(window.matchMedia('(max-width:860px)').matches && elements.panel){
    elements.panel.classList.toggle('open', open ?? !elements.panel.classList.contains('open'));
  }
}
function bind(id:string, type: 'value' | 'checked' = 'value', conv: (x:any)=>any=(x)=>x){
  const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
  if(!el) return;
  const apply = ()=>{
    const v:any = (type==='checked')? (el as HTMLInputElement).checked : (el as HTMLInputElement).value;
    if(id==='asciiPreset'){
      state.asciiChars = ASCII_PRESETS[v] || state.asciiChars;
      const asciiEl = document.getElementById('asciiChars') as HTMLInputElement | null;
      if(asciiEl) asciiEl.value = state.asciiChars;
    }
    (state as any)[id] = conv(v);
    if(id==='fontSize' || id==='asciiChars') flags.needFontMetrics = true;
    if(id==='resScale' || id==='fontSize') flags.needResize = true;
    saveStateThrottled();
  };
  if(type==='checked'){ (el as HTMLInputElement).checked = !!(state as any)[id]; }
  else (el as HTMLInputElement).value = (state as any)[id];
  el.addEventListener('input', apply, {passive:true});
  el.addEventListener('change', apply);
}
function bindAll(){
  bind('shape'); bind('size','value', parseFloat); bind('rotX','value', parseFloat); bind('rotY','value', parseFloat); bind('rotZ','value', parseFloat); bind('autoSpin','checked', Boolean); bind('spinSpeed','value', parseFloat);
  bind('ambient','value', parseFloat); bind('diffuse','value', parseFloat); bind('specular','value', parseFloat); bind('shininess','value', x=>parseInt(x)); bind('shadows','checked', Boolean); bind('shadowK','value', parseFloat); bind('ao','checked', Boolean); bind('aoStrength','value', parseFloat);
  bind('noiseEnabled','checked', Boolean); bind('noiseAmt','value', parseFloat); bind('noiseScale','value', parseFloat); bind('noiseSpeed','value', parseFloat); bind('noiseOct','value', x=>parseInt(x));
  bind('asciiPreset'); bind('asciiChars'); bind('invert','checked', Boolean); bind('colorEnabled','checked', Boolean); bind('gamma','value', parseFloat); bind('colorMode'); bind('palette');
  bind('fontSize','value', x=>parseInt(x)); bind('resScale','value', parseFloat); bind('maxSteps','value', x=>parseInt(x)); bind('maxDist','value', parseFloat); bind('taa','checked', Boolean); bind('taaAmt','value', parseFloat); bind('adaptive','checked', Boolean); bind('targetFps','value', x=>parseInt(x));
  document.getElementById('resetCam')?.addEventListener('click', ()=>{
    state.camDist = defaultState.camDist; state.camYaw = 0; state.camPitch = 0; state.rotX = defaultState.rotX; state.rotY = defaultState.rotY; state.rotZ = defaultState.rotZ; saveStateThrottled();
  });
  document.getElementById('resetAll')?.addEventListener('click', ()=>{
    resetAllState();
    for(const [k,v] of Object.entries(state)){
      const el = document.getElementById(k) as HTMLInputElement | HTMLSelectElement | null;
      if(!el) continue; if((el as HTMLInputElement).type==='checkbox') (el as HTMLInputElement).checked = !!v; else (el as HTMLInputElement).value = String(v);
    }
    flags.needFontMetrics = true; flags.needResize = true; saveStateThrottled();
  });
}
function bindChrome(){
  elements.panelBtn?.addEventListener('click', ()=> togglePanel());
  elements.mobilePanelToggle?.addEventListener('click', ()=> togglePanel());
  elements.fullscreenBtn?.addEventListener('click', toggleFullscreen);
  elements.mobileFullscreen?.addEventListener('click', toggleFullscreen);
  document.addEventListener('click', (e)=>{
    if(!elements.panel || !elements.panel.classList.contains('open')) return;
    const target = e.target as Node;
    const inside = elements.panel.contains(target) || target===elements.panelBtn || target===elements.mobilePanelToggle;
    if(!inside) elements.panel.classList.remove('open');
  });
}
export function initUI(){
  elements.canvas = $('#canvas') as HTMLCanvasElement|null;
  elements.viewer = $('#viewer');
  elements.fpsEl = $('#fps');
  elements.panel = $('#panel');
  elements.panelBtn = $('#panelBtn');
  elements.fullscreenBtn = $('#fullscreenBtn');
  elements.mobilePanelToggle = $('#mobilePanelToggle');
  elements.mobileFullscreen = $('#mobileFullscreen');
  bindAll(); bindChrome();
}
export function getCanvas(){ return elements.canvas; }
export function getViewer(){ return elements.viewer; }
export function setValue(id:string, value:any){ const el = document.getElementById(id) as HTMLInputElement | null; if(el) el.value = String(value); }
export function updateFPSText(fps:number){ if(elements.fpsEl) elements.fpsEl.textContent = `FPS: ${Math.round(fps)}`; }