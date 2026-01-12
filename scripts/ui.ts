import { ASCII_PRESETS } from './ascii';
import { defaultState, state, flags, saveStateThrottled, resetAllState } from './state';
import { startRecording } from './recorder';

const $ = <T extends Element = HTMLElement>(sel:string)=> document.querySelector(sel) as T | null;

interface UIElements { canvas:HTMLCanvasElement|null; viewer:HTMLElement|null; fpsEl:HTMLElement|null; panel:HTMLElement|null; fullscreenBtn:HTMLButtonElement|null; mobilePanelToggle:HTMLButtonElement|null; mobileFullscreen:HTMLButtonElement|null; }
const elements: UIElements = { canvas: null, viewer: null, fpsEl: null, panel: null, fullscreenBtn: null, mobilePanelToggle: null, mobileFullscreen: null };

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
    if(id==='autoSpin'){
      const rotEl = document.getElementById('rot' + state.autoSpinAxis) as HTMLInputElement;
      if(rotEl) rotEl.disabled = state.autoSpin;
    }
    if(id==='autoSpinAxis'){
      ['X','Y','Z'].forEach(ax => {
        const rotEl = document.getElementById('rot' + ax) as HTMLInputElement;
        if(rotEl) rotEl.disabled = false;
      });
      if(state.autoSpin){
        const rotEl = document.getElementById('rot' + state.autoSpinAxis) as HTMLInputElement;
        if(rotEl) rotEl.disabled = true;
      }
    }
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
  bind('shape'); bind('size','value', parseFloat); bind('rotX','value', parseFloat); bind('rotY','value', parseFloat); bind('rotZ','value', parseFloat); bind('autoSpin','checked', Boolean); bind('autoSpinAxis'); bind('spinSpeed','value', parseFloat);
  bind('ambient','value', parseFloat); bind('diffuse','value', parseFloat); bind('specular','value', parseFloat); bind('shininess','value', x=>parseInt(x)); bind('shadows','checked', Boolean); bind('shadowK','value', parseFloat); bind('ao','checked', Boolean); bind('aoStrength','value', parseFloat);
  bind('noiseEnabled','checked', Boolean); bind('noiseAmt','value', parseFloat); bind('noiseScale','value', parseFloat); bind('noiseSpeed','value', parseFloat); bind('noiseOct','value', x=>parseInt(x));
  bind('asciiPreset'); bind('asciiChars'); bind('invert','checked', Boolean); bind('colorEnabled','checked', Boolean); bind('gamma','value', parseFloat); bind('colorMode'); bind('palette');
  bind('fontSize','value', x=>parseInt(x)); bind('resScale','value', parseFloat); bind('maxSteps','value', x=>parseInt(x)); bind('maxDist','value', parseFloat); bind('taa','checked', Boolean); bind('taaAmt','value', parseFloat); bind('adaptive','checked', Boolean); bind('targetFps','value', x=>parseInt(x));  // Recording controls
  bind('recordDuration','value', x=>parseFloat(x)); bind('recordFps','value', x=>parseInt(x)); bind('recordResolution'); bind('recordWidth','value', x=>parseInt(x)); bind('recordHeight','value', x=>parseInt(x));
  let isRecording = false;
  const resSel = document.getElementById('recordResolution') as HTMLSelectElement | null;
  const customDiv = document.getElementById('recordCustom') as HTMLElement | null;
  const updateCustomVis = ()=>{ if(!customDiv || !resSel) return; customDiv.style.display = (resSel.value==='custom')? 'block' : 'none'; };
  if(resSel) resSel.onchange = ()=>{ updateCustomVis(); saveStateThrottled(); };
  updateCustomVis();
  const recordBtn = document.getElementById('recordBtn') as HTMLButtonElement | null;
  if(recordBtn) recordBtn.onclick = async ()=>{
    if(isRecording) return; isRecording = true;
    const canvas = elements.canvas;
    if(!canvas){ isRecording = false; return; }
    const btn = recordBtn;
    const status = document.getElementById('recordStatus');
    const duration = (state as any).recordDuration || 5;
    const fps = (state as any).recordFps || 30;
    const resolution = (state as any).recordResolution || 'canvas';
    const width = (state as any).recordWidth;
    const height = (state as any).recordHeight;
    btn.disabled = true; if(status) status.textContent = 'Recording...';
    try{
      const blob = await startRecording(canvas, {duration, fps, resolution, width, height}, (frame,total)=>{ if(status) status.textContent = `Recording... ${Math.round((frame/total)*100)}%`; });
      // ensure we only trigger one download even if this handler somehow ran twice
      try{
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); const now = new Date(); const stamp = now.toISOString().replace(/[:.]/g,'-');
        a.href = url; a.download = `asciid-recording-${stamp}.webm`;
        document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      }catch(e){ console.error('Download failed', e); }
      if(status) status.textContent = 'Done — saved';
    }catch(e){
      console.error('Recording failed', e); if(status) status.textContent = 'Error during recording';
    }finally{ btn.disabled = false; isRecording = false; setTimeout(()=>{ if(status) status.textContent = 'Idle'; }, 2000); }
  };  document.getElementById('resetCam')?.addEventListener('click', ()=>{
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
  elements.mobilePanelToggle?.addEventListener('click', ()=> togglePanel());
  elements.fullscreenBtn?.addEventListener('click', toggleFullscreen);
  elements.mobileFullscreen?.addEventListener('click', toggleFullscreen);
  document.addEventListener('click', (e)=>{
    if(!elements.panel || !elements.panel.classList.contains('open')) return;
    const target = e.target as Node;
    const inside = elements.panel.contains(target) || target===elements.mobilePanelToggle;
    if(!inside) elements.panel.classList.remove('open');
  });
}
export function initUI(){
  elements.canvas = $('#canvas') as HTMLCanvasElement|null;
  elements.viewer = $('#viewer');
  elements.fpsEl = $('#fps');
  elements.panel = $('#panel');
  elements.fullscreenBtn = $('#fullscreenBtn');
  elements.mobilePanelToggle = $('#mobilePanelToggle');
  elements.mobileFullscreen = $('#mobileFullscreen');
  bindAll();
  if(state.autoSpin){
    const rotEl = document.getElementById('rot' + state.autoSpinAxis) as HTMLInputElement;
    if(rotEl) rotEl.disabled = true;
  }
  bindChrome();
}
export function getCanvas(){ return elements.canvas; }
export function getViewer(){ return elements.viewer; }
export function setValue(id:string, value:any){ const el = document.getElementById(id) as HTMLInputElement | null; if(el) el.value = String(value); }
export function updateFPSText(fps:number){ if(elements.fpsEl) elements.fpsEl.textContent = `FPS: ${Math.round(fps)}`; }