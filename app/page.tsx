'use client';
import { useEffect } from 'react';
import { initUI, getCanvas, getViewer } from '../scripts/ui';
import { initInput } from '../scripts/input';
import { startRenderer } from '../scripts/renderer';

export default function Page(){
  useEffect(()=>{
    initUI();
    const canvas = getCanvas();
    const viewer = getViewer();
    if(canvas && viewer){
      initInput(canvas);
      startRenderer(canvas, viewer);
    }
  }, []);

  return (
    <div id="app">
      <div id="topbar">
        <span id="title">ASCII Raymarcher</span>
        <span className="pill tiny">Optimized • TAA • Adaptive • SDF</span>
        <span className="spacer" />
        <button id="fullscreenBtn" title="Fullscreen">Fullscreen</button>
        <span id="fps" className="pill tiny">FPS: --</span>
      </div>
      <div id="main">
        <div id="viewer">
          <canvas id="canvas" />
        </div>
        <div id="panel" className="">
          <details>
            <summary>📁 Presets</summary>
            <div className="group">
              <label>Preset name <input id="presetName" type="text" placeholder="Enter preset name" /></label>
              <div className="row">
                <button id="savePresetBtn" type="button">Save Preset</button>
                <button id="deletePresetBtn" type="button">Delete</button>
              </div>
              <label>Load preset
                <select id="loadPresetSelect">
                  <option value="">-- Select preset --</option>
                </select>
              </label>
              <div className="row">
                <button id="exportPresetsBtn" type="button">Export to JSON</button>
                <input id="importPresetsInput" type="file" accept=".json" style={{display: 'none'}} />
                <button id="importPresetsBtn" type="button">Import from JSON</button>
                <button id="resetPresetsBtn" type="button">Reset to Defaults</button>
              </div>
              <div className="hint tiny">Presets save all settings except camera position. Export creates a downloadable JSON file of current configuration.</div>
            </div>
          </details>
          <details open>
            <summary>🔧 Scene</summary>
            <div className="group">
              <label>Shape
                <select id="shape" defaultValue="Torus">
                  <option>Sphere</option>
                  <option>Box</option>
                  <option>Torus</option>
                  <option>Octahedron</option>
                  <option>Capsule</option>
                  <option>Cylinder</option>
                  <option>Cone</option>
                  <option>Pyramid</option>
                  <option>Ellipsoid</option>
                  <option>RoundedBox</option>
                  <option>TriPrism</option>
                  <option>HexPrism</option>
                  <option>Plane</option>
                  <option>Cross</option>
                  <option>Tetrahedron</option>
                  <option>Star</option>
                  <option>Heart</option>
                  <option>Egg</option>
                </select>
              </label>
              <label>Size <input id="size" type="range" min="0.2" max="2.5" step="0.01" defaultValue="1.1"/></label>
              <div className="row">
                <span className="tiny" style={{width:68}}>Rotation</span>
                <input id="rotX" type="range" min="-180" max="180" step="1" defaultValue="20" className="grow"/>
              </div>
              <div className="row">
                <span className="tiny" style={{width:68}} />
                <input id="rotY" type="range" min="-180" max="180" step="1" defaultValue="35" className="grow"/>
              </div>
              <div className="row">
                <span className="tiny" style={{width:68}} />
                <input id="rotZ" type="range" min="-180" max="180" step="1" defaultValue="0" className="grow"/>
              </div>
              <div className="row">
                <label className="inline"><input id="autoSpin" type="checkbox" defaultChecked /> Auto spin</label>
                <label>Axis
                  <select id="autoSpinAxis" defaultValue="X">
                    <option>X</option>
                    <option>Y</option>
                    <option>Z</option>
                  </select>
                </label>
                <label>Speed <input id="spinSpeed" type="range" min="-5" max="5" step="0.1" defaultValue="2.0"/></label>
              </div>
            </div>
          </details>
          <details open>
            <summary>💡 Lighting</summary>
            <div className="group">
              <label>Ambient <input id="ambient" type="range" min="0" max="1" step="0.01" defaultValue="0.25"/></label>
              <label>Diffuse <input id="diffuse" type="range" min="0" max="2" step="0.01" defaultValue="1.05"/></label>
              <label>Specular <input id="specular" type="range" min="0" max="2" step="0.01" defaultValue="0.5"/></label>
              <label>Shininess <input id="shininess" type="range" min="2" max="128" step="1" defaultValue="32"/></label>
              <div className="row">
                <label className="inline"><input id="shadows" type="checkbox" defaultChecked /> Shadows</label>
                <label>Softness <input id="shadowK" type="range" min="1" max="24" step="0.1" defaultValue="12"/></label>
              </div>
              <div className="row">
                <label className="inline"><input id="ao" type="checkbox" defaultChecked /> AO</label>
                <label>AO Strength <input id="aoStrength" type="range" min="0" max="2" step="0.01" defaultValue="0.9"/></label>
              </div>
            </div>
          </details>
          <details open>
            <summary>🌊 Surface Noise / Animation</summary>
            <div className="group">
              <label className="inline"><input id="noiseEnabled" type="checkbox" /> Enable noise</label>
              <label>Amount <input id="noiseAmt" type="range" min="0" max="0.8" step="0.001" defaultValue="0.16"/></label>
              <label>Scale <input id="noiseScale" type="range" min="0.2" max="6" step="0.01" defaultValue="2.0"/></label>
              <label>Speed <input id="noiseSpeed" type="range" min="0" max="4" step="0.01" defaultValue="0.9"/></label>
              <label>Octaves <input id="noiseOct" type="range" min="1" max="6" step="1" defaultValue="3"/></label>
            </div>
          </details>
          <details open>
            <summary>🎨 ASCII &amp; Color</summary>
            <div className="group">
              <label>ASCII preset
                <select id="asciiPreset" defaultValue="dense">
                  <option value="dense">Dense</option>
                  <option value="classic">Classic</option>
                  <option value="blocks">Blocks</option>
                  <option value="dots">Dots</option>
                  <option value="binary">Binary</option>
                  <option value="sparse">Sparse</option>
                  <option value="line">Line</option>
                  <option value="blocky">Blocky</option>
                  <option value="retro">Retro</option>
                </select>
              </label>
              <label>Characters
                <input id="asciiChars" type="text" defaultValue={" .,'`^:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$"} />
              </label>
              <div className="row">
                <label className="inline"><input id="invert" type="checkbox" /> Invert</label>
              </div>
              <div className="row">
                <label className="inline"><input id="colorEnabled" type="checkbox" defaultChecked /> Color</label>
                <label>Gamma <input id="gamma" type="range" min="0.6" max="2.4" step="0.01" defaultValue="1.0"/></label>
              </div>
              <label>Color mode
                <select id="colorMode" defaultValue="luma">
                  <option value="luma">Luma</option>
                  <option value="depth">Depth</option>
                  <option value="normal">Normal</option>
                  <option value="specular">Specular</option>
                  <option value="momentum">Momentum</option>
                  <option value="hue">Hue</option>
                  <option value="fresnel">Fresnel</option>
                  <option value="steps">Steps</option>
                  <option value="position">Position</option>
                  <option value="ao">AO</option>
                </select>
              </label>
              <label>Palette
                <select id="palette" defaultValue="viridis">
                  <option value="grayscale">Grayscale</option>
                  <option value="fire">Fire</option>
                  <option value="ice">Ice</option>
                  <option value="viridis">Viridis</option>
                  <option value="rainbow">Rainbow</option>
                  <option value="gameboy">Gameboy</option>
                  <option value="nes">NES</option>
                  <option value="sega">Sega</option>
                  <option value="retro">Retro</option>
                </select>
              </label>
              <label>Background color <input id="backgroundColor" type="color" defaultValue="#000000"/></label>
            </div>
          </details>
          <details open>
            <summary>⚙️ Render &amp; Performance</summary>
            <div className="group">
              <label>Font size <input id="fontSize" type="range" min="8" max="28" step="1" defaultValue="14"/></label>
              <label>Resolution <input id="resScale" type="range" min="0.5" max="2" step="0.01" defaultValue="1.0"/></label>
              <label>Max steps <input id="maxSteps" type="range" min="16" max="180" step="1" defaultValue="72"/></label>
              <label>Max distance <input id="maxDist" type="range" min="8" max="64" step="0.5" defaultValue="24"/></label>
              <div className="row">
                <label className="inline"><input id="taa" type="checkbox" defaultChecked /> Temporal AA</label>
                <label>Blend <input id="taaAmt" type="range" min="0" max="0.95" step="0.01" defaultValue="0.6"/></label>
              </div>
              <div className="row">
                <label className="inline"><input id="adaptive" type="checkbox" /> Adaptive res</label>
                <label>Target FPS <input id="targetFps" type="range" min="24" max="90" step="1" defaultValue="50"/></label>
              </div>
              <div className="row">
                <button id="resetCam" type="button">Reset view</button>
                <button id="resetAll" type="button" title="Reset all controls">Reset all</button>
              </div>
              <div className="hint tiny">Adaptive res keeps FPS stable. Increase Max steps for crisper edges/shadows. On phones, try Font 12–14 and Res 0.8–1.0.</div>
            </div>
          </details>
          <details>
            <summary>🎥 Recording</summary>
            <div className="group">
              <label>Duration (s) <input id="recordDuration" type="number" min="1" max="60" step="1" defaultValue={5} /></label>
              <label>FPS <input id="recordFps" type="number" min="1" max="120" step="1" defaultValue={30} /></label>
              <label>Resolution
                <select id="recordResolution" defaultValue="canvas">
                  <option value="canvas">Same as canvas</option>
                  <option value="1280x720">1280 × 720 (720p)</option>
                  <option value="1920x1080">1920 × 1080 (1080p)</option>
                  <option value="custom">Custom</option>
                </select>
              </label>
              <div id="recordCustom" style={{display: 'none'}}>
                <label>Width <input id="recordWidth" type="number" min="16" max="3840" step="1" defaultValue={1280} /></label>
                <label>Height <input id="recordHeight" type="number" min="16" max="2160" step="1" defaultValue={720} /></label>
              </div>
              <div className="row">
                <button id="recordBtn" type="button">Start Recording</button>
                <span id="recordStatus" className="tiny" style={{marginLeft:12}}>Idle</span>
              </div>
              <div className="hint tiny">Recording uses MediaRecorder (WebM) and may not be supported in all browsers. Large resolutions may be memory intensive.</div>
            </div>
          </details>
        </div>
      </div>
      <div id="floatingControls">
        <button id="mobilePanelToggle" type="button">Controls ☰</button>
        <button id="mobileFullscreen" type="button">⛶</button>
      </div>
    </div>
  );
}