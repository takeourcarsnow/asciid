# Advanced Performance Optimization Opportunities

This document outlines future optimization opportunities for maximum performance gains.

## Tier 1: High-Impact (5x-10x improvements) - WebGPU/WebGL

### GPU Accelerated Raymarching
**Difficulty**: Hard | **Potential**: 5x-10x FPS improvement

Convert the entire raymarching pipeline to compute shaders:

```glsl
// Fragment shader - GPU raymarching (pseudocode)
void main() {
  vec3 ro = rayOrigin;
  vec3 rd = normalize(rayDirection);
  
  float t = 0.0;
  for(int i = 0; i < MAX_STEPS; i++) {
    vec3 p = ro + rd * t;
    float d = mapScene(p);
    if(d < 0.001) { break; }
    t += d;
  }
  
  gl_FragColor = vec4(shade(t), 1.0);
}
```

**Benefits**:
- 1000s of pixels computed in parallel
- Direct GPU memory access
- No main thread blocking
- ~8x-10x speedup possible

**Implementation Path**:
1. Create WebGL context alongside Canvas2D
2. Compile fragment shader with SDF functions
3. Use screen-aligned quad for rendering
4. Keep existing UI system

**Resources**:
- [WebGL Tutorial](https://webglfundamentals.org/)
- [Compute Shaders in WebGPU](https://webgpu.org/)
- [Shadertoy](https://www.shadertoy.com/) - Excellent reference implementations

---

## Tier 2: Medium-Impact (2x-3x improvements) - Multi-threading

### WebWorker Raymarching Pipeline
**Difficulty**: Medium | **Potential**: 2x-3x FPS improvement

Offload raymarching to background threads:

```typescript
// Main thread
const workers = navigator.hardwareConcurrency || 4;
const renderWorkers = Array.from({length: workers}, () => new Worker('raymarcher.worker.js'));

// Split screen into horizontal bands
const bandHeight = gridRows / workers;
renderWorkers.forEach((worker, idx) => {
  worker.postMessage({
    startRow: idx * bandHeight,
    endRow: (idx + 1) * bandHeight,
    state, rotM, camPos, forward, right, up, time
  });
});

// Collect results
Promise.all(workerResults).then(bands => {
  // Composite bands onto canvas
});
```

**Benefits**:
- Non-blocking main thread
- True parallelization (2-4 cores utilized)
- UI remains responsive
- 2x-3x speedup on multi-core systems

**Implementation Steps**:
1. Create `scripts/raymarcher.worker.ts`
2. Move raymarching loop into worker
3. Split screen into CPU count bands
4. Stream results back to main thread

---

### Hybrid GPU + CPU Rendering
**Difficulty**: Hard | **Potential**: 3x-4x improvement

Use GPU for primary rendering, CPU for refinement:

```typescript
// GPU: Fast low-quality pass
// CPU: High-quality refinement of high-variance pixels
// Result: High quality at high speed
```

---

## Tier 3: Algorithmic Improvements (1.5x-2x)

### Quadtree Adaptive Sampling
**Difficulty**: Medium | **Potential**: 1.5x-2x improvement | **Implemented Framework**: ✅

Uses existing `AdaptiveSamplingManager` to intelligently sample:

```typescript
class QuadtreeAdaptiveSampler {
  subdivide(minX, maxX, minY, maxY, threshold) {
    const corner = [minX, maxX, minY, maxY];
    
    // Sample corners
    const c0 = sample(minX, minY);
    const c1 = sample(maxX, minY);
    const c2 = sample(minX, maxY);
    const c3 = sample(maxX, maxY);
    
    // Compute variance
    const variance = Math.max(...corners) - Math.min(...corners);
    
    if (variance > threshold) {
      // Subdivide recursively
      this.subdivide(minX, (minX+maxX)/2, minY, (minY+maxY)/2, threshold);
      // ... subdivide other 3 quadrants
    }
  }
}
```

**Benefits**:
- Focuses computation on image details
- Reduces samples in flat areas
- Progressive refinement friendly

**Integration**:
1. Implement `subdivide()` method in `AdaptiveSamplingManager`
2. Use variance tracking from existing system
3. Skip low-variance pixels

---

### Early Ray Termination
**Difficulty**: Low | **Potential**: 1.2x improvement

Stop raymarching when contribution becomes negligible:

```typescript
// Current: steps < maxSteps && t < maxDist
// Improved: steps < maxSteps && t < maxDist && contribution > threshold

const opacity = Math.pow(clamp(shade, 0, 1), gamma);
if (opacity < 0.01) break; // Skip nearly transparent contributions
```

---

## Tier 4: Memory & Cache Optimizations (1.1x-1.3x)

### Texture Atlasing for Fonts
**Difficulty**: Easy | **Potential**: 1.1x improvement | **Framework**: ✅

Pre-render all ASCII characters to single texture:

```typescript
class CharacterTextureAtlas {
  private atlas: OffscreenCanvas;
  private glyphs: Map<string, {x, y, w, h}>;
  
  renderTo(ctx, text, x, y, colors) {
    for (const [i, ch] of text.entries()) {
      const glyph = this.glyphs.get(ch);
      ctx.drawImage(this.atlas, glyph.x, glyph.y, glyph.w, glyph.h, x+i*w, y, w, h);
    }
  }
}
```

**Current Framework**: `CharacterTextureCache` in `optimization.ts`

---

### Typed Array Optimization
**Difficulty**: Medium | **Potential**: 1.15x improvement

Use Float32Array for all vector math:

```typescript
// Instead of: new Array(x, y, z) - generic allocation
// Use: Float32Array(3) - fixed-size, typed access
const v = new Float32Array(3);
v[0] = x; v[1] = y; v[2] = z;

// Benefit: JIT compiler can optimize better
```

---

## Tier 5: Feature-Specific Optimizations

### Shadow Caching
**Difficulty**: Medium | **Potential**: 1.3x (shadows on)

Cache soft shadow results:

```typescript
class ShadowCache {
  // Key: `${Math.round(p.x*10)},${p.y*10},${p.z*10}`
  // Value: shadow factor (0-1)
  private cache = new Map();
}
```

**When Effective**: Scenes with many overlapping objects

---

### Normal Map Approximation
**Difficulty**: Easy | **Potential**: 1.15x improvement

Use lower-precision normal calculation:

```typescript
// Current: 3 SDF evaluations per normal
// Improved: Use finite differences with larger epsilon
const e = 0.005; // Larger than 0.0015
```

**Trade-off**: Slight quality loss, measurable speedup

---

## Implementation Priority

### Quick Wins (This Week)
1. ✅ Spatial SDF caching - **DONE**
2. ✅ Sphere bounding rejection - **DONE**
3. ✅ Noise caching - **DONE**
- **Expected**: +20-35% FPS

### Medium Term (This Month)
1. Quadtree adaptive sampling (framework ready)
2. Character texture atlas (framework ready)
3. WebWorker parallelization
- **Expected**: +50-100% FPS

### Long Term (Infrastructure)
1. WebGL/WebGPU raymarching
2. Hybrid GPU+CPU pipeline
3. SIMD operations via TypedArrays
- **Expected**: 5x-10x FPS improvement

---

## Performance Testing Checklist

### Baseline Measurements
```typescript
// Add to renderer.ts
const perfMarkers = {
  raymarching: 0,
  shading: 0,
  rendering: 0,
  caching: 0
};

performance.mark('raymarching-start');
// ... raymarching code
performance.mark('raymarching-end');
```

### Profiling
1. Chrome DevTools > Performance tab
2. Record 3-5 seconds of rendering
3. Check:
   - Time in `render()` function
   - Time in raymarching loop
   - Memory allocation rate
   - GC pause frequency

### Benchmarking Suite
```typescript
// Proposed: scripts/benchmark.ts
interface BenchmarkResult {
  fps: number;
  memoryMB: number;
  gcPauses: number;
  cacheHitRate: number;
}

function benchmark(preset: string): BenchmarkResult {
  // Run 10 seconds of rendering
  // Measure performance metrics
}
```

---

## References & Resources

### GPU Rendering
- [WebGL Fundamentals](https://webglfundamentals.org/)
- [WebGPU Specification](https://www.w3.org/TR/webgpu/)
- [Shadertoy](https://www.shadertoy.com/) - Reference implementations

### Raymarching
- [Inigo Quilez - Distance Functions](https://iquilezles.org/articles/distfunctions/)
- [Raymarching Workshop](https://www.youtube.com/watch?v=PGtv-dBi2wE)

### Web Performance
- [MDN Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [Web Vitals](https://web.dev/vitals/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)

### JavaScript Optimization
- [V8 Optimization Tips](https://github.com/v8/v8/wiki/Using-the-V8-API)
- [TypedArray Performance](https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/)

