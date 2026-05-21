import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-cv-demo',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './cv-demo.component.html',
  styleUrl: './cv-demo.component.scss'
})
export class CvDemoComponent implements AfterViewInit {

  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  capturedImage: string | null = null;
  prediction = false
  resultA:any
  resultB:any
  segmentedImage:any

  constructor(private http: HttpClient) {}

  ngAfterViewInit() {
    this.startCamera();
  }

  startCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          this.video.nativeElement.srcObject = stream;
        })
        .catch(err => {
          console.error("Error accessing camera: ", err);
        });
    } else {
      alert('Camera not supported in this browser.');
    }
  }

  capture() {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const context = canvas.getContext('2d');

    if (context) {
      context.drawImage(this.video.nativeElement, 0, 0, canvas.width, canvas.height);
      this.capturedImage = canvas.toDataURL('image/jpg'); // base64 image
      this.sendToBackend(this.capturedImage)
    }
  }

  sendToBackend(imageBase64: string) {
    this.http.post('/api/ai/cv/detect', {
      image: imageBase64
    }).subscribe({
      next: (res: any) => {
        console.log('Upload success', res)
        this.segmentedImage = res.segmented_image
        this.prediction = true
        this.resultA = res.resultA
        this.resultB = res.resultB
      },
      error: err => console.error('Upload failed', err)
    });
  }
}
