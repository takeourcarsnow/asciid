import { clamp } from './utils';

export function palGrayscale(t:number){ t=clamp(t,0,1); const v=Math.round(t*255); return [v,v,v] as [number,number,number]; }
export function palFire(t:number){
  t=clamp(t,0,1);
  const c = t<.3 ? [t/.3*180, 0, 0]
        : t<.6 ? [180+ (t-.3)/.3*75, (t-.3)/.3*90, 0]
        : t<.85? [255, 180+(t-.6)/.25*70, 0]
               : [255, 250, (t-.85)/.15*255];
  return c.map(v=>clamp(Math.round(v),0,255)) as [number,number,number];
}
export function palIce(t:number){
  t=clamp(t,0,1);
  const r = Math.round(10 + 40*t);
  const g = Math.round(50 + 170*t);
  const b = Math.round(90 + 165*t);
  return [r,g,b] as [number,number,number];
}
export function palRainbow(t:number){
  t=clamp(t,0,1);
  const h = t*6; const i=Math.floor(h);
  const f=h - i; const q=1-f;
  let r=0,g=0,b=0;
  switch(i%6){
    case 0: r=1; g=f; b=0; break;
    case 1: r=q; g=1; b=0; break;
    case 2: r=0; g=1; b=f; break;
    case 3: r=0; g=q; b=1; break;
    case 4: r=f; g=0; b=1; break;
    case 5: r=1; g=0; b=q; break;
  }
  return [Math.round(r*255),Math.round(g*255),Math.round(b*255)] as [number,number,number];
}
export function palViridis(t:number){
  t=clamp(t,0,1);
  const r = Math.round(68 + 167*t - 39*t*t);
  const g = Math.round(1 + 198*t - 75*t*t);
  const b = Math.round(84 + 77*t + 90*t*t);
  return [clamp(r,0,255),clamp(g,0,255),clamp(b,0,255)] as [number,number,number];
}

// Gameboy-ish 4-shade green palette (discrete look)
export function palGameboy(t:number): [number,number,number] {
  t = clamp(t,0,1);
  const shades:[number,number,number][] = [ [15,56,15], [48,98,48], [139,172,15], [155,188,15] ];
  const idx = Math.min(shades.length-1, Math.floor(t*shades.length));
  return shades[idx];
}

// Simple NES-like palette sampled from warm/cool retro hues
export function palNES(t:number): [number,number,number]{
  t = clamp(t,0,1);
  const p: [number,number,number][] = [
    [27,27,53],[63,92,170],[139,131,94],[177,103,58],[212,157,68],[230,202,139],[201,201,201],[120,150,180]
  ];
  const n = p.length; const i = Math.floor(t*(n-1)); const f = t*(n-1) - i; const a = p[i]; const b = p[Math.min(n-1,i+1)];
  return [ Math.round(a[0]*(1-f)+b[0]*f), Math.round(a[1]*(1-f)+b[1]*f), Math.round(a[2]*(1-f)+b[2]*f) ] as [number,number,number];
}

// Sega-like cyan/blue/magenta neon gradient
export function palSega(t:number): [number,number,number] {
  t = clamp(t,0,1);
  if(t < 0.33){ const f = t/0.33; return [ Math.round(16*(1-f)+18*f), Math.round(48*(1-f)+216*f), Math.round(128*(1-f)+255*f) ] as [number,number,number]; }
  else if(t < 0.66){ const f = (t-0.33)/0.33; return [ Math.round(18*(1-f)+220*f), Math.round(216*(1-f)+12*f), Math.round(255*(1-f)+200*f) ] as [number,number,number]; }
  else { const f = (t-0.66)/0.34; return [ Math.round(220*(1-f)+255*f), Math.round(12*(1-f)+200*f), Math.round(200*(1-f)+240*f) ] as [number,number,number]; }
}

// Sepia / retro film look
export function palRetro(t:number): [number,number,number] {
  t = clamp(t,0,1);
  const r = Math.round(80 + 160*t);
  const g = Math.round(60 + 120*t);
  const b = Math.round(45 + 80*t);
  return [r,g,b] as [number,number,number];
}

export const PALETTES: Record<string,(t:number)=>[number,number,number]> = {
  grayscale: palGrayscale,
  fire: palFire,
  ice: palIce,
  rainbow: palRainbow,
  viridis: palViridis,
  gameboy: palGameboy,
  nes: palNES,
  sega: palSega,
  retro: palRetro,
};