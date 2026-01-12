import { clamp } from './utils';
import { defaultState, state } from './state';

const key: Record<string, boolean> = {};
interface PointerState { active:boolean; x:number; y:number; lastX:number; lastY:number; id:number|null; second:number|null; lastDist:number; }
const pointer: PointerState = { active:false, x:0, y:0, lastX:0, lastY:0, id:null, second:null, lastDist:0 };

export function initInput(canvas: HTMLCanvasElement){
  window.addEventListener('keydown', e=>{
    key[e.key.toLowerCase()] = true;
    if(['w','a','s','d','q','e','r'].includes(e.key.toLowerCase())) e.preventDefault();
  });
  window.addEventListener('keyup', e=>{ key[e.key.toLowerCase()] = false; });

  canvas.addEventListener('pointerdown', (e)=>{
    canvas.setPointerCapture(e.pointerId);
    if(pointer.active && pointer.second==null && e.pointerId!==pointer.id){
      pointer.second = e.pointerId; pointer.lastDist = 0;
    }else if(!pointer.active){
      pointer.active = true; pointer.id = e.pointerId;
      pointer.x = pointer.lastX = e.clientX; pointer.y = pointer.lastY = e.clientY;
    }
  });
  canvas.addEventListener('pointermove', (e)=>{
    if(!pointer.active) return;
    if(pointer.second!=null){
      const a = e.pointerId===pointer.id? {x:e.clientX, y:e.clientY} : {x:pointer.x, y:pointer.y};
      const others = e.pointerId===pointer.second? {x:e.clientX, y:e.clientY} : {x:pointer.lastX, y:pointer.lastY};
      const dx=a.x-others.x, dy=a.y-others.y;
      const dist=Math.hypot(dx,dy);
      if(pointer.lastDist>0){
        const delta = (dist - pointer.lastDist) * 0.01;
        state.camDist = clamp(state.camDist - delta, 1.5, 24);
      }
      pointer.lastDist = dist;
    }else if(e.pointerId===pointer.id){
      const dx = e.clientX - pointer.lastX;
      const dy = e.clientY - pointer.lastY;
      pointer.lastX = e.clientX; pointer.lastY = e.clientY;
      const degPerPixel = 0.004 * (180 / Math.PI);
      state.rotY += dx * degPerPixel;
      state.rotX = clamp(state.rotX + dy * degPerPixel, -180, 180);
      state.rotY = ((state.rotY % 360) + 360) % 360;
      if (state.rotY > 180) state.rotY -= 360;
      const rotXEl = document.getElementById('rotX') as HTMLInputElement;
      if (rotXEl) rotXEl.value = state.rotX.toFixed(1);
      const rotYEl = document.getElementById('rotY') as HTMLInputElement;
      if (rotYEl) rotYEl.value = state.rotY.toFixed(1);
    }
  }, {passive:false});
  canvas.addEventListener('pointerup', (e)=>{
    if(e.pointerId===pointer.second) pointer.second=null;
    else if(e.pointerId===pointer.id){ pointer.active=false; pointer.id=null; }
  });
  canvas.addEventListener('wheel', (e)=>{
    e.preventDefault();
    const s = Math.exp(-e.deltaY * 0.0012);
    state.camDist = clamp(state.camDist * s, 1.5, 24);
  }, {passive:false});
}

export function updateKeyboard(dt:number){
  const speed = 0.8 * dt;
  const speedDeg = speed * (180 / Math.PI);
  if(key['r']){ state.camYaw=0; state.camPitch=0; state.camDist=defaultState.camDist; }
  if(key['a']) { state.rotZ -= speedDeg; state.rotZ = ((state.rotZ % 360) + 360) % 360; if (state.rotZ > 180) state.rotZ -= 360; }
  if(key['d']) { state.rotZ += speedDeg; state.rotZ = ((state.rotZ % 360) + 360) % 360; if (state.rotZ > 180) state.rotZ -= 360; }
  if(key['w']) { state.rotX = clamp(state.rotX - speedDeg, -180, 180); }
  if(key['s']) { state.rotX = clamp(state.rotX + speedDeg, -180, 180); }
  if(key['q']) state.camDist = clamp(state.camDist + speed*2, 1.5, 24);
  if(key['e']) state.camDist = clamp(state.camDist - speed*2, 1.5, 24);
  const rotXEl = document.getElementById('rotX') as HTMLInputElement;
  if (rotXEl) rotXEl.value = state.rotX.toFixed(1);
  const rotYEl = document.getElementById('rotY') as HTMLInputElement;
  if (rotYEl) rotYEl.value = state.rotY.toFixed(1);
  const rotZEl = document.getElementById('rotZ') as HTMLInputElement;
  if (rotZEl) rotZEl.value = state.rotZ.toFixed(1);
}