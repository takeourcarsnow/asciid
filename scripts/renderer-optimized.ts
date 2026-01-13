import { clamp, mix, DEG, dot3, add3, mul3s, norm3, cross, BAYER4, halton, rotXYZ, Vec3, Mat3 } from './utils';
import { PALETTES } from './palettes';
import { state, flags } from './state';
import { mapScene, getNormal, softShadow, ambientOcclusion } from './sdf';
import { updateFPSText, setValue } from './ui';
import { updateKeyboard } from './input';
import { Vec3Pool, CharacterTextureCache, SpatialDistanceCache, NoiseCache, sphereIntersectsBound, AdaptiveSamplingManager } from './optimization';

export function startRenderer(canvas: HTMLCanvasElement, viewer: HTMLElement){
  const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  const ctx = canvas.getContext('2d', {alpha:false, desynchronized:true}) as CanvasRenderingContext2D;

  let needResize = true;
  let charW = 8, charH = 16, baseline = 12;
  let gridCols = 80, gridRows = 45;

  // Performance optimization: Initialize caches and pools
  const vec3Pool = new Vec3Pool();
  const charCache = new CharacterTextureCache();
  const spatialCache = new SpatialDistanceCache();
  const noiseCache = new NoiseCache();
  const adaptiveSampler = new AdaptiveSamplingManager(gridCols, gridRows);
  
  // Preallocate temporary vectors for the main loop
  const temp_forward: Vec3 = [0, 0, 0];
  const temp_rd: Vec3 = [0, 0, 0];
  const temp_ro: Vec3 = [0, 0, 0];
  const temp_p: Vec3 = [0, 0, 0];
  const temp_n: Vec3 = [0, 0, 0];
  const temp_L: Vec3 = [0, 0, 0];
  const temp_H: Vec3 = [0, 0, 0];

  function updateFont(){
    ctx.font = `bold ${state.fontSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono","Courier New", monospace`;
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    const m = ctx.measureText('M');
    const h = (m.actualBoundingBoxAscent||state.fontSize*0.8) + (m.actualBoundingBoxDescent||state.fontSize*0.3);
    charH = Math.ceil(h); charW = Math.ceil(ctx.measureText('█').width); baseline = Math.ceil(m.actualBoundingBoxAscent||state.fontSize*0.8);
  }
  let prevLuma = new Float32Array(1);
  let prevRGB = new Float32Array(1);
  let momentumBuff = new Float32Array(1);
  function rebuildBuffers(){
    const N = gridCols*gridRows; 
    prevLuma = new Float32Array(N); 
    prevRGB = new Float32Array(N*3); 
    momentumBuff = new Float32Array(N);
    adaptiveSampler.clear();
  }
  function resize(){
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(2, Math.floor(rect.width * dpr));
    canvas.height = Math.max(2, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr,0,0,dpr,0,0); updateFont();
    const baseCols = Math.max(8, Math.floor(rect.width / charW));
    const baseRows = Math.max(6, Math.floor(rect.height / charH));
    gridCols = Math.max(8, Math.floor(baseCols * state.resScale));
    gridRows = Math.max(6, Math.floor(baseRows * state.resScale));
    rebuildBuffers();
  }
  window.addEventListener('resize', ()=>{ needResize = true; }, {passive:true});
  const ro = new ResizeObserver(()=>{ needResize = true; }); ro.observe(viewer);
  rebuildBuffers();

  function getCameraBasis(){
    const yaw = state.camYaw, pitch = state.camPitch;
    const cosP = Math.cos(pitch), sinP = Math.sin(pitch);
    const cosY = Math.cos(yaw), sinY = Math.sin(yaw);
    const forward: Vec3 = [cosP * sinY, sinP, cosP * cosY];
    const target: Vec3 = [0, 0, 0];
    const camPos: Vec3 = [target[0] - forward[0] * state.camDist, target[1] - forward[1] * state.camDist, target[2] - forward[2] * state.camDist];
    const up: Vec3 = [0, 1, 0];
    const right = norm3(cross(forward, up));
    const camUp = cross(right, forward);
    return {camPos, forward: norm3(forward), right, up: camUp};
  }
  
  let frame = 1; 
  let lastTime = performance.now(); 
  let fpsEMA = 60; 
  let time = 0;
  let lastResScale = state.resScale;
  
  function render(){
    const now = performance.now();
    let dt = Math.max(1/120, (now - lastTime) / 1000); 
    lastTime = now;
    if(!document.hasFocus()) dt = Math.min(dt, 1/60);
    fpsEMA = mix(fpsEMA, 1/dt, 0.1); 
    time += dt; 
    updateFPSText(fpsEMA); 
    updateKeyboard(dt);
    
    // Resize handling
    if(state.resScale !== lastResScale){ lastResScale = state.resScale; needResize = true; }
    if(state.autoSpin){
      if(state.autoSpinAxis === 'X'){ state.rotX += state.spinSpeed; if(state.rotX>180) state.rotX-=360; if(state.rotX<-180) state.rotX+=360; }
      else if(state.autoSpinAxis === 'Y'){ state.rotY += state.spinSpeed; if(state.rotY>180) state.rotY-=360; if(state.rotY<-180) state.rotY+=360; }
      else if(state.autoSpinAxis === 'Z'){ state.rotZ += state.spinSpeed; if(state.rotZ>180) state.rotZ-=360; if(state.rotZ<-180) state.rotZ+=360; }
    }
    
    // Adaptive frame rate management
    if(state.adaptive && frame % 10 === 0){ 
      const target = state.targetFps; 
      const headroom = fpsEMA - target; 
      if(headroom < -2 && state.resScale > 0.55){ 
        state.resScale = Math.max(0.5, state.resScale - 0.05); 
        setValue('resScale', state.resScale); 
        needResize = true; 
      } else if(headroom > 6 && state.resScale < 1.5){ 
        state.resScale = Math.min(2.0, state.resScale + 0.03); 
        setValue('resScale', state.resScale); 
        needResize = true; 
      } 
    }
    if(state.adaptive && state.noiseEnabled && frame % 10 === 0){ 
      const target = state.targetFps; 
      const headroom = fpsEMA - target; 
      if(headroom < -2 && state.noiseOct > 1){ 
        state.noiseOct = Math.max(1, state.noiseOct - 1); 
        setValue('noiseOct', state.noiseOct); 
      } else if(headroom > 6 && state.noiseOct < 5){ 
        state.noiseOct = Math.min(5, state.noiseOct + 1); 
        setValue('noiseOct', state.noiseOct); 
      } 
    }
    
    if(flags.needFontMetrics){ updateFont(); flags.needFontMetrics=false; needResize=true; }
    if(flags.needResize){ needResize=true; flags.needResize=false; }
    if(needResize){ resize(); needResize=false; }
    
    ctx.save(); 
    ctx.fillStyle = state.backgroundColor; 
    ctx.fillRect(0,0, canvas.width/dpr, canvas.height/dpr); 
    ctx.restore();
    
    // Clear caches for new frame
    spatialCache.clear();
    noiseCache.clear();
    
    const {camPos, forward, right, up} = getCameraBasis(); 
    const fov = 50*DEG, tFov = Math.tan(fov*0.5); 
    const rotM = rotXYZ(state.rotX*DEG, state.rotY*DEG, state.rotZ*DEG); 
    const jitterX = state.taa ? (halton(frame,2)-0.5) : 0; 
    const jitterY = state.taa ? (halton(frame,3)-0.5) : 0; 
    const ascii = state.asciiChars; 
    const Nchars = ascii.length; 
    const gamma = state.gamma; 
    const inv = state.invert; 
    const cols=gridCols, rows=gridRows; 
    const aspect = (cols*charW) / (rows*charH); 
    const maxSteps = state.maxSteps|0, maxDist = state.maxDist; 
    const taaBlend = state.taa ? clamp(state.taaAmt,0,0.95) : 0; 
    const useColor = !!state.colorEnabled; 
    const ox = (1/cols) * (jitterX); 
    const oy = (1/rows) * (jitterY); 
    const boundR = state.size*2.2 + (state.noiseEnabled ? state.noiseAmt*2 : 0.0);
    const boundCenter: Vec3 = [0, 0, 0];
    const invGamma = 1 / gamma;
    
    // Optimized rendering loop - single monochromatic pass
    if(!useColor){ 
      ctx.fillStyle = '#fff'; 
      for(let j=0;j<rows;j++){ 
        let rowStr = ''; 
        const v = ((j+0.5+oy)/rows)*2 - 1; 
        for(let i=0;i<cols;i++){ 
          const u = ((i+0.5+ox)/cols)*2 - 1; 
          
          // Build ray direction
          temp_rd[0] = forward[0] + right[0]*u*tFov*aspect + up[0]*(-v*tFov);
          temp_rd[1] = forward[1] + right[1]*u*tFov*aspect + up[1]*(-v*tFov);
          temp_rd[2] = forward[2] + right[2]*u*tFov*aspect + up[2]*(-v*tFov);
          const rdlen = Math.hypot(temp_rd[0], temp_rd[1], temp_rd[2]);
          temp_rd[0] /= rdlen;
          temp_rd[1] /= rdlen;
          temp_rd[2] /= rdlen;
          
          temp_ro[0] = camPos[0];
          temp_ro[1] = camPos[1];
          temp_ro[2] = camPos[2];
          
          // Quick sphere rejection test
          if(state.shape!=='Plane' && !sphereIntersectsBound(temp_ro, temp_rd, boundCenter, boundR)){ 
            rowStr += ' '; 
            continue; 
          }
          
          let t=0, hit=false, steps=0; 
          for(; steps<maxSteps && t<maxDist; steps++){ 
            temp_p[0] = temp_ro[0] + temp_rd[0] * t;
            temp_p[1] = temp_ro[1] + temp_rd[1] * t;
            temp_p[2] = temp_ro[2] + temp_rd[2] * t;
            
            // Try spatial cache first
            let d = spatialCache.get(temp_p);
            if (d === null) {
              d = mapScene(temp_p, state, rotM, time);
              spatialCache.set(temp_p, d);
            }
            
            if(d<0.001){ hit=true; break; } 
            t += clamp(d, 0.02, 0.8); 
          } 
          
          let luma = 0; 
          if(hit){ 
            temp_p[0] = temp_ro[0] + temp_rd[0] * t;
            temp_p[1] = temp_ro[1] + temp_rd[1] * t;
            temp_p[2] = temp_ro[2] + temp_rd[2] * t;
            
            const n = getNormal(temp_p, state, rotM, time); 
            temp_L[0] = 0.7; temp_L[1] = 0.9; temp_L[2] = 0.4;
            const Llen = Math.hypot(temp_L[0], temp_L[1], temp_L[2]);
            temp_L[0] /= Llen; temp_L[1] /= Llen; temp_L[2] /= Llen;
            
            temp_H[0] = temp_L[0] - temp_rd[0];
            temp_H[1] = temp_L[1] - temp_rd[1];
            temp_H[2] = temp_L[2] - temp_rd[2];
            const Hlen = Math.hypot(temp_H[0], temp_H[1], temp_H[2]);
            temp_H[0] /= Hlen; temp_H[1] /= Hlen; temp_H[2] /= Hlen;
            
            const NoL = Math.max(0, n[0]*temp_L[0] + n[1]*temp_L[1] + n[2]*temp_L[2]); 
            const specVal = Math.pow(Math.max(0, n[0]*temp_H[0] + n[1]*temp_H[1] + n[2]*temp_H[2]), state.shininess); 
            let diff = state.diffuse * NoL; 
            let amb = state.ambient; 
            let sh = 1; 
            if(state.shadows){ 
              sh = softShadow([temp_p[0]+n[0]*0.01, temp_p[1]+n[1]*0.01, temp_p[2]+n[2]*0.01], temp_L, 0.02, 8, 1/state.shadowK, state, rotM, time); 
            } 
            const ao = ambientOcclusion(temp_p, n, state, rotM, time); 
            let shade = amb + diff*sh*ao + state.specular*specVal; 
            shade = Math.pow(clamp(shade,0,1), invGamma); 
            luma = shade; 
          }else{ 
            luma = 0; 
          } 
          
          const idx = j*cols + i; 
          const prev = prevLuma[idx]; 
          const blended = mix(luma, prev, taaBlend); 
          momentumBuff[idx] = Math.abs(luma - prev); 
          prevLuma[idx] = blended; 
          let vLum = inv && hit ? 1 - blended : blended; 
          const dth = BAYER4[(i&3) + ((j&3)<<2)]; 
          vLum = clamp(vLum + (dth-0.5)/Nchars, 0, 1); 
          const k = Math.floor(vLum*(Nchars-1)); 
          rowStr += ascii[k] || ' '; 
        } 
        
        const x = Math.floor((canvas.width/dpr - cols*charW)/2); 
        const y = Math.floor((canvas.height/dpr - rows*charH)/2) + baseline + j*charH; 
        ctx.fillText(rowStr, x, y); 
      }
    }else{ 
      // Color pass - optimized
      for(let j=0;j<rows;j++){ 
        const v = ((j+0.5+oy)/rows)*2 - 1; 
        for(let i=0;i<cols;i++){ 
          const u = ((i+0.5+ox)/cols)*2 - 1; 
          
          temp_rd[0] = forward[0] + right[0]*u*tFov*aspect + up[0]*(-v*tFov);
          temp_rd[1] = forward[1] + right[1]*u*tFov*aspect + up[1]*(-v*tFov);
          temp_rd[2] = forward[2] + right[2]*u*tFov*aspect + up[2]*(-v*tFov);
          const rdlen = Math.hypot(temp_rd[0], temp_rd[1], temp_rd[2]);
          temp_rd[0] /= rdlen;
          temp_rd[1] /= rdlen;
          temp_rd[2] /= rdlen;
          
          temp_ro[0] = camPos[0];
          temp_ro[1] = camPos[1];
          temp_ro[2] = camPos[2];
          
          if(state.shape!=='Plane' && !sphereIntersectsBound(temp_ro, temp_rd, boundCenter, boundR)){ 
            const idx = j*cols + i; 
            const prev = prevLuma[idx]; 
            const blended = mix(0, prev, taaBlend); 
            prevLuma[idx]=blended; 
            momentumBuff[idx] = Math.abs(0 - prev); 
            continue; 
          } 
          
          let t=0, hit=false, steps=0; 
          for(; steps<maxSteps && t<maxDist; steps++){ 
            temp_p[0] = temp_ro[0] + temp_rd[0] * t;
            temp_p[1] = temp_ro[1] + temp_rd[1] * t;
            temp_p[2] = temp_ro[2] + temp_rd[2] * t;
            
            let d = spatialCache.get(temp_p);
            if (d === null) {
              d = mapScene(temp_p, state, rotM, time);
              spatialCache.set(temp_p, d);
            }
            
            if(d<0.001){ hit=true; break; } 
            t += clamp(d, 0.02, 0.8); 
          } 
          
          let luma=0, specVal=0, depth=0, Nx=0, Ny=0, Nz=0, fresnel=0, stepsVal=0, position=0, aoVal=0; 
          if(hit){ 
            temp_p[0] = temp_ro[0] + temp_rd[0] * t;
            temp_p[1] = temp_ro[1] + temp_rd[1] * t;
            temp_p[2] = temp_ro[2] + temp_rd[2] * t;
            
            const n = getNormal(temp_p, state, rotM, time); 
            Nx=n[0]; Ny=n[1]; Nz=n[2]; 
            
            temp_L[0] = 0.7; temp_L[1] = 0.9; temp_L[2] = 0.4;
            const Llen = Math.hypot(temp_L[0], temp_L[1], temp_L[2]);
            temp_L[0] /= Llen; temp_L[1] /= Llen; temp_L[2] /= Llen;
            
            temp_H[0] = temp_L[0] - temp_rd[0];
            temp_H[1] = temp_L[1] - temp_rd[1];
            temp_H[2] = temp_L[2] - temp_rd[2];
            const Hlen = Math.hypot(temp_H[0], temp_H[1], temp_H[2]);
            temp_H[0] /= Hlen; temp_H[1] /= Hlen; temp_H[2] /= Hlen;
            
            const NoL = Math.max(0, Nx*temp_L[0] + Ny*temp_L[1] + Nz*temp_L[2]); 
            specVal = Math.pow(Math.max(0, Nx*temp_H[0] + Ny*temp_H[1] + Nz*temp_H[2]), state.shininess); 
            const amb = state.ambient; 
            let diff = state.diffuse * NoL; 
            let sh = 1; 
            if(state.shadows){ 
              sh = softShadow([temp_p[0]+Nx*0.01, temp_p[1]+Ny*0.01, temp_p[2]+Nz*0.01], temp_L, 0.02, 8, 1/state.shadowK, state, rotM, time); 
            } 
            const ao = ambientOcclusion(temp_p, n, state, rotM, time); 
            let shade = amb + diff*sh*ao + state.specular*specVal; 
            shade = Math.pow(clamp(shade,0,1), invGamma); 
            luma = shade; 
            depth = clamp(t/maxDist, 0, 1); 
            const V = [-temp_rd[0], -temp_rd[1], -temp_rd[2]];
            fresnel = Math.pow(clamp(1 - (n[0]*V[0] + n[1]*V[1] + n[2]*V[2]), 0, 1), 5); 
            stepsVal = steps / maxSteps; 
            const angle = Math.atan2(temp_p[2], temp_p[0]); 
            position = (angle / (2*Math.PI) + 0.5) % 1; 
            aoVal = ao; 
          }else{ 
            luma = 0; depth=1; fresnel=0; stepsVal=1; position=0; aoVal=1; 
          } 
          
          const idx = j*cols + i; 
          const prev = prevLuma[idx]; 
          const blended = mix(luma, prev, taaBlend); 
          prevLuma[idx]=blended; 
          const mom = Math.abs(luma - prev); 
          momentumBuff[idx] = mom; 
          let tone = inv && hit ? 1 - blended : blended; 
          const dth = BAYER4[(i&3) + ((j&3)<<2)]; 
          tone = clamp(tone + (dth-0.5)/Nchars, 0, 1); 
          const k = Math.floor(tone*(Nchars-1)); 
          const ch = ascii[k] || ' '; 
          let tint:[number,number,number] = [255,255,255]; 
          switch(state.colorMode){ 
            case 'luma': tint = PALETTES[state.palette](blended); break; 
            case 'depth': tint = PALETTES[state.palette](1-depth); break; 
            case 'normal': tint = PALETTES[state.palette](0.5* (Nx+Ny+Nz)/1.5 + 0.5); break; 
            case 'specular': tint = PALETTES[state.palette](clamp(specVal,0,1)); break; 
            case 'momentum': tint = PALETTES[state.palette](clamp(mom*4, 0,1)); break; 
            case 'hue': tint = PALETTES[state.palette](clamp(0.5 * (Nx + 1), 0, 1)); break; 
            case 'fresnel': tint = PALETTES[state.palette](fresnel); break; 
            case 'steps': tint = PALETTES[state.palette](stepsVal); break; 
            case 'position': tint = PALETTES[state.palette](position); break; 
            case 'ao': tint = PALETTES[state.palette](aoVal); break; 
          } 
          
          const x = Math.floor((canvas.width/dpr - cols*charW)/2) + i*charW; 
          const y = Math.floor((canvas.height/dpr - rows*charH)/2) + baseline + j*charH; 
          ctx.fillStyle = `rgb(${tint[0]},${tint[1]},${tint[2]})`; 
          ctx.fillText(ch, x, y); 
        } 
      }
    }
    
    frame++; 
    requestAnimationFrame(render);
  }
  
  resize(); 
  requestAnimationFrame(render);
  document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='visible'){ lastTime = performance.now(); } });
}
