
import { Component, ElementRef, ViewChild, signal, computed, effect, inject, viewChild, AfterViewInit } from '@angular/core';
import * as ort from 'onnxruntime-web';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { delay } from 'rxjs';
@Component({
  selector: 'app-yolo',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './yolo.component.html',
  styleUrl: './yolo.component.scss'
})
export class YoloComponent{
  video = viewChild<ElementRef<HTMLVideoElement>>('video');
  canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  private session: ort.InferenceSession | null = null;
  isLoading = signal(false);
  isModelLoaded = signal(false);
  isDetecting = signal(false);
  isCameraReady = signal(false);
  errorMessage = signal('');
  lastDetections = signal<any[]>([]);
  lastDrawTime = signal(0);
  readonly DRAW_HOLD_MS = 5000;
  // status = computed(() => {
  //   if (this.isLoading()) return 'Loading...';
  //   if (!this.isModelLoaded()) return 'Model not loaded';
  //   if (this.isDetecting()) return 'Detecting emotions...';
  //   return 'Ready';
  // });

  classNames = ["angry", "contempt", "disgust", "fear", "happy", "natural", "sad", "sleepy", "surprised"] as const;

  // Effect for canvas context (runs when canvas changes)
  private canvasCtx = effect(() => {
    const canvasRef = this.canvas();
    if (canvasRef) {
      canvasRef.nativeElement.width = 640;
      canvasRef.nativeElement.height = 480;
    }
  });

  constructor(protected http: HttpClient) {
    this.setupCamera();
  }

  async setupCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      const videoRef = this.video();
      if (videoRef) {
        videoRef.nativeElement.srcObject = stream;
        this.isCameraReady.set(true);
      }
    } catch (err) {
      this.errorMessage.set('Camera access denied: ' + (err as Error).message);
    }
  }

  async loadModel() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      let providers = ['wasm'];
      if (!('WebAssembly' in window)) {
        providers = ['cpu'];
      }

      const sessionOptions = { executionProviders: providers };

      this.session = await ort.InferenceSession.create(
        '/assets/models/Yolo_v11_Model.onnx',
        sessionOptions
      );

      console.log('Model loaded successfully with providers:', sessionOptions.executionProviders);

      this.isModelLoaded.set(true);
    } catch (err: any) {
      console.error('Model load failed:', err);
      this.errorMessage.set(`Failed to load model: ${err.message}. Check console for details (e.g., MIME/WASM issues).`);

      try {
        this.session = await ort.InferenceSession.create(
          '/assets/models/Yolo_v11_Model.onnx',
          { executionProviders: ['cpu'] }
        );
        console.log('Fallback: Model loaded with CPU provider');
        this.isModelLoaded.set(true);
      } catch (fallbackErr: any) {
        this.errorMessage.set(`CPU fallback failed: ${(fallbackErr as Error).message}`);
      }
    } finally {
      this.isLoading.set(false);
    }
}

  // startDetection() {
  //   if (!this.isCameraReady()) return;

  //   this.isDetecting.set(true);

  //   const videoEl = this.video()!.nativeElement;
  //   const canvasEl = this.canvas()!.nativeElement;
  //   const ctx = canvasEl.getContext('2d')!;
  //   if (!ctx) return;
    
  //   const sendFrame = async () => {
  //     if (!this.isDetecting()) return;

  //     ctx.drawImage(videoEl, 0, 0, 640, 480);

  //     const dataUrl = canvasEl.toDataURL('image/jpeg', 0.8);
  //     const req = this.http.post<any>('/api/ai/ultra/detect',{image: dataUrl},{
  //           headers: {'Content-Type':'application/json; charset=utf-8'}
  //         });

  //     req.subscribe(res=>{
  //       ctx.drawImage(videoEl, 0, 0, 640, 480);
  //       this.drawBoxes(ctx, res.detections);
        
  //     })
      
  //     // await new Promise(resolve => setTimeout(resolve, 600));

  //     // this.http
  //     //   .post<{ detections: any[] }>('http://localhost:5000/detect', {
  //     //     image: dataUrl
  //     //   })
  //     //   .subscribe({
  //     //     next: res => {
  //     //       // 4. Redraw video frame + boxes
  //     //       ctx.drawImage(videoEl, 0, 0, 640, 480);
  //     //       this.drawBoxes(ctx, res.detections);
  //     //     },
  //     //     error: err => {
  //     //       console.error('Backend error', err);
  //     //       this.errorMessage.set('Backend error – check Flask');
  //     //     }
  //     //   });

  //     if (this.isDetecting()) {
  //       requestAnimationFrame(sendFrame);
  //     }
  //   };

  //   sendFrame();
  // }
  // startDetection() {
  //   if (!this.isCameraReady()) return;

  //   this.isDetecting.set(true);

  //   const video = this.video()!.nativeElement;
  //   const canvas = this.canvas()!.nativeElement;
  //   const ctx = canvas.getContext('2d')!;

  //   const sendLiveFrame = async () => {
  //     if (!this.isDetecting()) return;

  //     // 1. Capture frame
  //     ctx.drawImage(video, 0, 0, 640, 480);

  //     // 2. Convert to binary blob (JPEG, quality 0.7)
  //     canvas.toBlob(async (blob) => {
  //       if (!blob || !this.isDetecting()) return;

  //       try {
  //         // 3. Send binary blob (FormData)
  //         const formData = new FormData();
  //         formData.append('image', blob, 'frame.jpg');

  //         const res = await fetch('/api/ai/ultra/detect', {
  //           method: 'POST',
  //           body: formData
  //         }).then(r => r.json());

  //         // 4. Draw result
  //         ctx.drawImage(video, 0, 0, 640, 480);
  //         this.drawBoxes(ctx, res.detections);

  //         // 5. Delay after API call
  //         await new Promise(r => setTimeout(r, 350))

  //       } catch (err) {
  //         console.error('API error:', err);
  //         this.errorMessage.set('Backend error');
  //         await new Promise(r => setTimeout(r, 350));
  //       }

  //       // 6. Loop
  //       if (this.isDetecting()) {
  //         requestAnimationFrame(sendLiveFrame);
  //       }
  //     }, 'image/jpeg', 0.7); // 70% quality → small + fast
  //   };

  //   requestAnimationFrame(sendLiveFrame);
  // }

  startDetection() {
    if (!this.isCameraReady()) return;

    this.isDetecting.set(true);

    const video = this.video()!.nativeElement;
    const canvas = this.canvas()!.nativeElement;
    const ctx = canvas.getContext('2d')!;

    // Draw loop: runs every frame, but only updates boxes if new data or hold expired
    const drawLoop = (now: number = performance.now()) => {
      if (!this.isDetecting()) return;

      // Always draw current video frame
      ctx.save();
      ctx.scale(-1, 1);  // Flip horizontally
      ctx.drawImage(video, -640, 0, 640, 480);  // Draw mirrored
      ctx.restore();

      const detections = this.lastDetections();
      const lastTime = this.lastDrawTime();

      // If we have recent detections → draw them
      if (detections.length > 0 && now - lastTime < this.DRAW_HOLD_MS) {
        this.drawBoxes(ctx, detections);
      }
      // Else: clear old boxes (optional: fade out later)

      requestAnimationFrame(drawLoop);
    };

    // API loop: sends frame, updates lastDetections
    const sendFrame = async () => {
      if (!this.isDetecting()) return;
      
      ctx.drawImage(video, 0, 0, 640, 480);
      canvas.toBlob(async (blob) => {
        if (!blob || !this.isDetecting()) return;

        try {
          const formData = new FormData();
          formData.append('image', blob, 'frame.jpg');

          const res = await fetch('/api/ai/ultra/detect', {
            method: 'POST',
            body: formData
          }).then(r => r.json());

          // UPDATE: Save new detections + timestamp
          this.lastDetections.set(res.detections);
          this.lastDrawTime.set(performance.now());

        } catch (err) {
          console.error('API error:', err);
          this.errorMessage.set('Backend error: connection lost');
        }

        // Delay after API call (optional throttling)
        await new Promise(r => setTimeout(r, 500));

        if (this.isDetecting()) sendFrame();
      }, 'image/jpeg', 0.7);
    };

    // Start both loops
    requestAnimationFrame(drawLoop);
    sendFrame();
  }

  stopDetection() {
    this.isDetecting.set(false);
    // this.status.set('Stopped');
  }

  private drawBoxes(ctx: CanvasRenderingContext2D, detections: any[]) {
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 3;
    ctx.font = '18px Arial';
    ctx.fillStyle = '#ffffff';

    detections.forEach(d => {
      const w = d.x2 - d.x1;
      const h = d.y2 - d.y1;

      ctx.strokeRect(d.x1, d.y1, w, h);

      const txt = `${d.label} ${(d.conf * 100).toFixed(0)}%`;
      const txtW = ctx.measureText(txt).width;

      ctx.fillRect(d.x1, d.y1 - 25, txtW + 10, 25);
      ctx.fillStyle = '#000';
      ctx.fillText(txt, d.x1 + 5, d.y1 - 5);
      ctx.fillStyle = '#fff';
    });
  }
  private preprocess(imageData: ImageData): ort.Tensor {
    const { data, width, height } = imageData;
    const input = new Float32Array(3 * height * width);  // CHW format for YOLO

    // Normalize to [0,1] and convert RGB -> CHW
    for (let i = 0, j = 0; i < data.length; i += 4, j += 1) {
      const idx = (j % width) + (Math.floor(j / width)) * width;
      input[idx] = data[i] / 255;  // R
      input[width * height + idx] = data[i + 1] / 255;  // G
      input[width * height * 2 + idx] = data[i + 2] / 255;  // B
    }

    return new ort.Tensor('float32', input, [1, 3, height, width]);
  }

  private postprocess(output: ort.Tensor, origW: number, origH: number): any[] {
    const boxes: any[] = [];
    const data = output.data as Float32Array;
    const [_, numDetections, numAttrs] = output.dims;  // e.g., [1, 8400, 12] for 9 classes + conf + 4 box

    for (let i = 0; i < numDetections; i++) {
      const offset = i * numAttrs;
      const conf = data[offset + 4];  // Confidence (adjust index if needed)
      if (conf < 0.5) continue;

      // Box: cx, cy, w, h -> x1, y1, x2, y2
      const cx = data[offset] * origW;
      const cy = data[offset + 1] * origH;
      const w = data[offset + 2] * origW;
      const h = data[offset + 3] * origH;
      const x1 = Math.max(0, cx - w / 2);
      const y1 = Math.max(0, cy - h / 2);
      const x2 = Math.min(origW, cx + w / 2);
      const y2 = Math.min(origH, cy + h / 2);

      // Class (max over classes 5+)
      let maxCls = 0;
      let maxProb = 0;
      for (let c = 0; c < this.classNames.length; c++) {
        const prob = data[offset + 5 + c];
        if (prob > maxProb) {
          maxProb = prob;
          maxCls = c;
        }
      }

      boxes.push({ x1, y1, x2, y2, conf: conf * maxProb, label: this.classNames[maxCls] });
    }

    return boxes;
  }

}

