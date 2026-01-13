// Memory pooling for frequently allocated temporary vectors
export class Vec3Pool {
  private pool: Array<[number, number, number]> = [];
  
  acquire(): [number, number, number] {
    return this.pool.pop() || [0, 0, 0];
  }
  
  release(v: [number, number, number]) {
    this.pool.push(v);
  }
}

// Fast inline math operations with minimal allocations
export const add3Inline = (a: [number, number, number], b: [number, number, number], out: [number, number, number]) => {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
};

export const mul3sInline = (a: [number, number, number], s: number, out: [number, number, number]) => {
  out[0] = a[0] * s;
  out[1] = a[1] * s;
  out[2] = a[2] * s;
};

export const norm3Inline = (a: [number, number, number], out: [number, number, number]) => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  out[0] = a[0] / l;
  out[1] = a[1] / l;
  out[2] = a[2] / l;
};

export const dot3Inline = (a: [number, number, number], b: [number, number, number]) =>
  a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export const crossInline = (a: [number, number, number], b: [number, number, number], out: [number, number, number]) => {
  out[0] = a[1] * b[2] - a[2] * b[1];
  out[1] = a[2] * b[0] - a[0] * b[2];
  out[2] = a[0] * b[1] - a[1] * b[0];
};

// ASCII character texture cache for fast rendering
export class CharacterTextureCache {
  private cache: Map<string, ImageData> = new Map();
  private ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  private charW: number = 8;
  private charH: number = 16;
  private fontSize: number = 14;
  
  constructor(fontSize: number = 14) {
    this.fontSize = fontSize;
    const canvas = new (typeof OffscreenCanvas !== 'undefined' ? OffscreenCanvas : HTMLCanvasElement)(256, 256);
    this.ctx = canvas.getContext('2d') as any;
    this.ctx.font = `bold ${fontSize}px ui-monospace`;
    const m = this.ctx.measureText('M');
    this.charH = Math.ceil((m.actualBoundingBoxAscent || fontSize * 0.8) + (m.actualBoundingBoxDescent || fontSize * 0.3));
    this.charW = Math.ceil(this.ctx.measureText('█').width);
  }
  
  getCharImage(char: string, color: string): ImageData {
    const key = `${char}-${color}`;
    if (this.cache.has(key)) return this.cache.get(key)!;
    
    const canvas = new (typeof OffscreenCanvas !== 'undefined' ? OffscreenCanvas : HTMLCanvasElement)(this.charW, this.charH);
    const ctx = canvas.getContext('2d') as any;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, this.charW, this.charH);
    ctx.fillStyle = 'white';
    ctx.font = this.ctx.font;
    ctx.fillText(char, 0, Math.ceil(this.charH * 0.75));
    const imageData = ctx.getImageData(0, 0, this.charW, this.charH);
    
    this.cache.set(key, imageData);
    return imageData;
  }
  
  clear() {
    this.cache.clear();
  }
}

// Spatial caching for scene distance field evaluations
export class SpatialDistanceCache {
  private grid: Map<string, number> = new Map();
  private cellSize: number = 0.1;
  
  getKey(p: [number, number, number]): string {
    const cx = Math.floor(p[0] / this.cellSize);
    const cy = Math.floor(p[1] / this.cellSize);
    const cz = Math.floor(p[2] / this.cellSize);
    return `${cx},${cy},${cz}`;
  }
  
  get(p: [number, number, number]): number | null {
    const key = this.getKey(p);
    return this.grid.get(key) ?? null;
  }
  
  set(p: [number, number, number], distance: number) {
    const key = this.getKey(p);
    this.grid.set(key, distance);
  }
  
  clear() {
    this.grid.clear();
  }
  
  getHitRate() {
    return this.grid.size;
  }
}

// Noise value cache for the current frame
export class NoiseCache {
  private cache: Map<string, number> = new Map();
  private hits = 0;
  private attempts = 0;
  
  getKey(x: number, y: number, z: number, octaves: number): string {
    return `${Math.round(x * 1000)},${Math.round(y * 1000)},${Math.round(z * 1000)},${octaves}`;
  }
  
  get(x: number, y: number, z: number, octaves: number): number | null {
    this.attempts++;
    const key = this.getKey(x, y, z, octaves);
    const val = this.cache.get(key);
    if (val !== undefined) this.hits++;
    return val ?? null;
  }
  
  set(x: number, y: number, z: number, octaves: number, value: number) {
    const key = this.getKey(x, y, z, octaves);
    this.cache.set(key, value);
  }
  
  clear() {
    this.cache.clear();
  }
  
  getHitRate() {
    return this.attempts > 0 ? (this.hits / this.attempts * 100).toFixed(2) : '0.00';
  }
}

// Bounding sphere quick rejection
export function sphereIntersectsBound(origin: [number, number, number], direction: [number, number, number], center: [number, number, number], radius: number): boolean {
  const oc = [origin[0] - center[0], origin[1] - center[1], origin[2] - center[2]] as [number, number, number];
  const b = oc[0] * direction[0] + oc[1] * direction[1] + oc[2] * direction[2];
  const c = oc[0] * oc[0] + oc[1] * oc[1] + oc[2] * oc[2] - radius * radius;
  const h = b * b - c;
  return h >= 0;
}

// Adaptive sampling state manager
export class AdaptiveSamplingManager {
  private variance: Float32Array;
  private cols: number;
  private rows: number;
  private threshold: number = 0.05;
  
  constructor(cols: number, rows: number) {
    this.cols = cols;
    this.rows = rows;
    this.variance = new Float32Array(cols * rows);
  }
  
  updateVariance(i: number, j: number, newVal: number, prevVal: number) {
    if (i >= 0 && i < this.cols && j >= 0 && j < this.rows) {
      this.variance[j * this.cols + i] = Math.abs(newVal - prevVal);
    }
  }
  
  shouldSampleNeighbors(i: number, j: number): boolean {
    if (i < 0 || i >= this.cols || j < 0 || j >= this.rows) return false;
    return this.variance[j * this.cols + i] > this.threshold;
  }
  
  clear() {
    this.variance.fill(0);
  }
}
