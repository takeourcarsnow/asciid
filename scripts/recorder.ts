export type RecordingOptions = {
  duration: number; // seconds
  fps: number;
  resolution: string; // 'canvas' | '1280x720' | '1920x1080' | 'custom'
  width?: number;
  height?: number;
};

function chooseMime(){
  if((window as any).MediaRecorder && (MediaRecorder as any).isTypeSupported){
    if((MediaRecorder as any).isTypeSupported('video/webm;codecs=vp9')) return 'video/webm;codecs=vp9';
    if((MediaRecorder as any).isTypeSupported('video/webm;codecs=vp8')) return 'video/webm;codecs=vp8';
  }
  return 'video/webm';
}

export function startRecording(canvas: HTMLCanvasElement, opts: RecordingOptions, onProgress?: (frame:number, total:number)=>void): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if(!canvas) return reject(new Error('No canvas'));
    const fps = Math.max(1, Math.min(120, Math.floor(opts.fps || 30)));
    const duration = Math.max(1, Math.min(600, Math.floor(opts.duration || 5)));

    let targetW = canvas.width;
    let targetH = canvas.height;
    if(opts.resolution === '1280x720'){ targetW = 1280; targetH = 720; }
    else if(opts.resolution === '1920x1080'){ targetW = 1920; targetH = 1080; }
    else if(opts.resolution === 'custom' && opts.width && opts.height){ targetW = Math.max(16, Math.min(3840, opts.width)); targetH = Math.max(16, Math.min(2160, opts.height)); }

    const off = document.createElement('canvas');
    off.width = targetW; off.height = targetH;
    const ctx = off.getContext('2d');
    if(!ctx) return reject(new Error('Could not create 2D context'));

    const stream = (off as any).captureStream ? (off as any).captureStream(fps) : (off as any).mozCaptureStream ? (off as any).mozCaptureStream(fps) : null;
    if(!stream) return reject(new Error('captureStream not supported'));

    const mime = chooseMime();
    let recorded: Blob[] = [];
    let recorder: MediaRecorder;
    try{
      recorder = new MediaRecorder(stream, { mimeType: mime });
    }catch(e){
      try{ recorder = new MediaRecorder(stream); }catch(err){ return reject(err); }
    }

    recorder.ondataavailable = (ev: BlobEvent)=>{ if(ev.data && ev.data.size) recorded.push(ev.data); };
    // ensure we only reject once on error
    let finished = false;
    recorder.onerror = (e)=>{ console.error('recorder error', e); if(!finished){ finished = true; reject(e); } };

    const totalFrames = duration * fps;
    let frame = 0;
    const intervalMs = 1000 / fps;

    const drawFrame = ()=>{
      try{ ctx.drawImage(canvas, 0, 0, targetW, targetH); }
      catch(e){ /* ignore drawing errors */ }
      frame++;
      if(onProgress) onProgress(frame, totalFrames);
      if(frame >= totalFrames){ stopRecording(); }
    };

    let intervalId = window.setInterval(drawFrame, intervalMs);
    let stopped = false;
    let safety: number | null = null;

    function stopRecording(){
      if(stopped) return; stopped = true;
      clearInterval(intervalId);
      // ask recorder to flush pending data before stopping
      try{ if(typeof recorder.requestData === 'function') recorder.requestData(); }catch(e){}
      try{ recorder.stop(); }catch{}
      // stop tracks to free resources
      try{ stream.getTracks().forEach((t: MediaStreamTrack)=>t.stop()); }catch{}
      if(safety){ clearTimeout(safety); safety = null; }
    }

    recorder.onstop = ()=>{
      if(finished) return;
      finished = true;
      const blob = new Blob(recorded, { type: mime });
      resolve(blob);
    };

    recorder.start();
    // kick one immediate draw to avoid blank first frame
    drawFrame();

    // safety timeout (in case something goes wrong)
    safety = window.setTimeout(()=>{
      if(frame < totalFrames){ stopRecording(); }
      if(safety){ clearTimeout(safety); safety = null; }
    }, (duration+5)*1000);
  });
}
