import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hand-detection',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './hand-detection.component.html',
  styleUrl: './hand-detection.component.scss'
})

export class HandDetectionComponent implements AfterViewInit, OnDestroy {
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  private intervalId?: number;

  // CHOOSE YOUR FPS HERE (delay in milliseconds)
  delayBetweenRequests = 250;  // 100ms = 10 FPS (perfect balance)
  // Try these:

  constructor(private http: HttpClient) {}

  ngAfterViewInit() {
    this.startCamera();
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        this.video.nativeElement.srcObject = stream;
        this.video.nativeElement.play();

        // Start sending frames with fixed delay
        this.intervalId = window.setInterval(() => {
          this.captureAndSend();
        }, this.delayBetweenRequests);
      })
      .catch(err => console.error("Camera error:", err));
  }

  private captureAndSend() {
    const video = this.video.nativeElement;
    const canvas = this.canvas.nativeElement;
    const ctx = canvas.getContext('2d')!;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const base64 = canvas.toDataURL('image/jpeg', 0.8);

    this.http.post<any>('/api/ai/ultra/detect-skeleton', { image: base64 })
      .subscribe({
        next: (res) => {
          this.drawSkeletonAndDirection(ctx, res.hands);
        },
        error: (err) => {
          console.log("Server busy, will try again...");
        }
      });
  }

  private drawSkeletonAndDirection(ctx: CanvasRenderingContext2D, hands: any[]) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(this.video.nativeElement, 0, 0);

    hands.forEach(hand => {
      const landmarks = hand.landmarks;
      const direction = hand.direction || "Stationary";
      if (!landmarks || landmarks.length === 0) return;

      const connections = [
        [0,1],[1,2],[2,3],[3,4], [0,5],[5,6],[6,7],[7,8],
        [0,9],[9,10],[10,11],[11,12], [0,13],[13,14],[14,15],[15,16],
        [0,17],[17,18],[18,19],[19,20]
      ];

      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 5;
      connections.forEach(([i, j]) => {
        const p1 = landmarks[i], p2 = landmarks[j];
        if (p1?.[0] > 0 && p1?.[1] > 0 && p2?.[0] > 0 && p2?.[1] > 0) {
          ctx.beginPath();
          ctx.moveTo(p1[0], p1[1]);
          ctx.lineTo(p2[0], p2[1]);
          ctx.stroke();
        }
      });

      ctx.fillStyle = '#ff00ff';
      landmarks.forEach((pt: number[]) => {
        if (pt?.[0] > 0 && pt?.[1] > 0) {
          ctx.beginPath();
          ctx.arc(pt[0], pt[1], 8, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      let arrow = '';
      let color = '#aaaaaa';
      switch(direction) {
        case 'Left':   arrow = '←←← LEFT';   color = '#ff0066'; break;
        case 'Right':  arrow = 'RIGHT →→→';  color = '#00ff00'; break;
        case 'Up':     arrow = '↑↑↑ UP';     color = '#0099ff'; break;
        case 'Down':   arrow = 'DOWN ↓↓↓';   color = '#ffff00'; break;
        default:       arrow = '● Stationary'; color = '#aaaaaa';
      }

      const wrist = landmarks[0];
      if (wrist?.[0] > 0 && wrist?.[1] > 0) {
        ctx.font = 'bold 42px Arial';
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(wrist[0] - 150, wrist[1] - 100, 300, 80);
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(arrow, wrist[0], wrist[1] - 55);
      }
    });
  }

  
}