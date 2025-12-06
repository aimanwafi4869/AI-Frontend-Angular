import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-quickdraw',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './quickdraw.component.html',
  styleUrl: './quickdraw.component.scss'
})
export class QuickdrawComponent {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  private ctx!: CanvasRenderingContext2D;
  private drawing = false;

  prediction: any | null = null;
  isPredicting = false;
  error: string | null = null;
  selectedFile: File | null = null;
  base64Output: string = ''
  // Change to your Flask server URL
  private apiUrl = '/api/ai/quickdraw/detect';

  constructor(private http: HttpClient, private ngZone: NgZone) {}

  ngAfterViewInit() {
    const canvas = this.canvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.lineWidth = 12;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = '#000';

    // Mouse events
    canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    canvas.addEventListener('mousemove', (e) => this.draw(e));
    canvas.addEventListener('mouseup', () => this.stopDrawing());
    canvas.addEventListener('mouseout', () => this.stopDrawing());

    // Touch events (mobile)
    canvas.addEventListener('touchstart', (e) => this.startDrawing(e.touches[0]));
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this.draw(e.touches[0]);
    });
    canvas.addEventListener('touchend', () => this.stopDrawing());
  }

  startDrawing(e: MouseEvent | Touch) {
    this.drawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(e.clientX - this.canvas.nativeElement.offsetLeft, e.clientY - this.canvas.nativeElement.offsetTop);
  }

  draw(e: MouseEvent | Touch) {
    if (!this.drawing) return;
    this.ctx.lineTo(e.clientX - this.canvas.nativeElement.offsetLeft, e.clientY - this.canvas.nativeElement.offsetTop);
    this.ctx.stroke();
  }

  stopDrawing() {
    this.drawing = false;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    this.prediction = null;
    this.error = null;
  }
  
   predict() {
    this.isPredicting = true;
    this.error = null;
    
    // const dataURL = this.canvas.nativeElement.toDataURL('image/png'); // Default is 'image/png'
      
    // Assign the result to the output variable
    // this.base64Output = dataURL;
    // this.base64Output = this.base64Output.split(';base64')[1]
    // console.log('Base64 data URL:', this.base64Output);
    // this.http.post<any>(this.apiUrl, {'image':this.base64Output}).subscribe({
    //     next: (res) => {
    //       this.prediction = res;
    //       this.isPredicting = false;
    //     },
    //     error: (err) => {
    //       this.error = err.error?.error || 'Prediction failed. Is the server running?';
    //       this.isPredicting = false;
    //     }
    // })
    this.canvas.nativeElement.toBlob((blob) => {
      if (!blob) {
        this.error = 'Failed to capture canvas';
        this.isPredicting = false;
        return;
      }
      console.log('abc')
      const formData = new FormData();
      formData.append('file', blob, 'sketch.png');
      // this.http.post<any>(this.apiUrl, formData).subscribe({
      //   next: (res) => {
      //     console.log(res)
      //     this.prediction = res;
      //     this.isPredicting = false;
      //     this.selectedFile = null;
      //     this.fileInput.nativeElement.value = '';
      //   },
      //   error: (err) => {
      //     this.error = err.error?.error || 'Server error';
      //     this.isPredicting = false;
      //   }
      // });
      this.ngZone.run(() => {
        this.http.post<any>(this.apiUrl, formData).subscribe({
        next: (res) => {
          this.prediction = res;
          this.isPredicting = false;
        },
        error: (err) => {
          this.error = err.error?.error || 'Prediction failed. Is the server running?';
          this.isPredicting = false;
        }
      });
      })
      
    }, 'image/jpg');
    
  }
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      this.selectedFile = file;
      this.error = null;
    } else {
      this.selectedFile = null;
      this.error = 'Please select a PNG or JPG file';
    }
  }

  predictFromFile(): void {
    if (!this.selectedFile) return;
    this.isPredicting = true;
    this.error = null;
    this.uploadFile(this.selectedFile, this.selectedFile.name);
  }

  // === SHARED UPLOAD LOGIC ===
  private uploadFile(file: Blob | File, filename: string): void {
    const form = new FormData();
    form.append('file', file, filename);

    this.http.post<any>(this.apiUrl, form).subscribe({
      next: (res) => {
        this.prediction = res;
        this.isPredicting = false;
        this.selectedFile = null;
        this.fileInput.nativeElement.value = '';
      },
      error: (err) => {
        this.error = err.error?.error || 'Server error';
        this.isPredicting = false;
      }
    });
  }
}
