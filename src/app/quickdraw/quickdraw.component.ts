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
  
  canvasWidth = 280; 
  canvasHeight = 280; 
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  private ctx!: CanvasRenderingContext2D;
  private drawing = false;
  lineWidth = 15; 
  labels: string[] = [
  "airplane", "alarm clock", "ambulance", "angel", "animal migration", "ant", "anvil",
  "apple", "arm", "asparagus", "axe", "backpack", "banana", "bandage", "barn",
  "baseball", "baseball bat", "basket", "basketball", "bat", "bathtub", "beach",
  "bear", "beard", "bed", "bee", "belt", "bench", "bicycle", "binoculars", "bird",
  "birthday cake", "blackberry", "blueberry", "book", "boomerang", "bottlecap",
  "bowtie", "bracelet", "brain", "bread", "bridge", "broccoli", "broom", "bucket",
  "bulldozer", "bus", "bush", "butterfly", "cactus", "cake", "calculator", "calendar",
  "camel", "camera", "camouflage", "campfire", "candle", "cannon", "canoe", "car",
  "carrot", "castle", "cat", "ceiling fan", "cell phone", "cello", "chair", "chandelier",
  "church", "circle", "clarinet", "clock", "cloud", "coffee cup", "compass", "computer",
  "cookie", "cooler", "couch", "cow", "crab", "crayon", "crocodile", "crown", "cup",
  "diamond", "dishwasher", "diving board", "dog", "dolphin", "donut", "door", "dragon",
  "dresser", "drill", "drums", "duck", "dumbbell", "ear", "elbow", "elephant", "envelope",
  "eraser", "eye", "eyeglasses", "face", "fan", "feather", "fence", "finger", "fire hydrant",
  "fireplace", "firetruck", "fish", "flamingo", "flashlight", "flip flops", "floor lamp",
  "flower", "flying saucer", "foot", "fork", "frog", "frying pan", "garden", "garden hose",
  "giraffe", "goatee", "golf club", "grapes", "grass", "guitar", "hamburger", "hammer", "hand",
  "harp", "hat", "headphones", "hedgehog", "helicopter", "helmet", "hexagon", "hockey puck",
  "hockey stick", "horse", "hospital", "hot air balloon", "hot dog", "hot tub", "hourglass",
  "house", "house plant", "hurricane", "ice cream", "jacket", "jail", "kangaroo", "key",
  "keyboard", "knee", "knife", "ladder", "lantern", "laptop", "leaf", "leg", "light bulb",
  "lighter", "lighthouse", "lightning", "line", "lion", "lipstick", "lobster", "lollipop",
  "mailbox", "map", "marker", "matches", "megaphone", "mermaid", "microphone", "microwave",
  "monkey", "moon", "mosquito", "motorbike", "mountain", "mouse", "moustache", "mouth", "mug",
  "mushroom", "nail", "necklace", "nose", "ocean", "octagon", "octopus", "onion", "oven", "owl",
  "paint can", "paintbrush", "palm tree", "panda", "pants", "paper clip", "parachute", "parrot",
  "passport", "peanut", "pear", "peas", "pencil", "penguin", "piano", "pickup truck", "picture frame",
  "pig", "pill", "pineapple", "pizza", "pliers", "police car", "pond", "pool", "popsicle", "postcard",
  "potato", "power outlet", "purse", "rabbit", "raccoon", "radio", "rain", "rainbow", "rake",
  "remote control", "rhinoceros", "rifle", "river", "roller coaster", "rollerskates", "sailboat",
  "sandwich", "saw", "saxophone", "school bus", "scissors", "scorpion", "screwdriver", "sea turtle",
  "see saw", "shark", "sheep", "shoe", "shorts", "shovel", "sink", "skateboard", "skull", "skyscraper",
  "sleeping bag", "smiley face", "snail", "snake", "snorkel", "snowflake", "snowman", "soccer ball",
  "sock", "speedboat", "spider", "spoon", "spreadsheet", "square", "squiggle", "squirrel", "stairs",
  "star", "steak", "stereo", "stethoscope", "stitches", "stop sign", "stove", "strawberry",
  "streetlight", "string bean", "submarine", "suitcase", "sun", "swan", "sweater", "swing set",
  "sword", "table", "teapot", "teddy bear", "telephone", "television", "tennis racquet", "tent",
  "tiger", "toaster", "toe", "toilet", "tooth", "toothbrush", "toothpaste", "tornado", "tractor",
  "traffic light", "train", "tree", "triangle", "trombone", "truck", "trumpet", "t-shirt", "umbrella",
  "underwear", "van", "vase", "violin", "washing machine", "watermelon", "waterslide", "whale",
  "wheel", "windmill", "wine bottle", "wine glass", "wristwatch", "yoga", "zebra", "zigzag"
];

  tableRows: string[][] = [];

  prediction: any | null = null;
  isPredicting = false;
  error: string | null = null;
  selectedFile: File | null = null;
  base64Output: string = ''

  constructor(private http: HttpClient, private ngZone: NgZone) {this.createTable();}

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

  createTable() {
    const sorted = [...this.labels].sort();
    const perCol = 20;
    const numCols = Math.ceil(sorted.length / perCol);

    // Create 2D array for table rows
    for (let i = 0; i < perCol; i++) {
      const row: string[] = [];
      for (let j = 0; j < numCols; j++) {
        const idx = j * perCol + i;
        row.push(idx < sorted.length ? sorted[idx] : '');
      }
      this.tableRows.push(row);
    }
  }

  startDrawing(e: MouseEvent | Touch) {
    this.drawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(e.clientX - this.canvas.nativeElement.offsetLeft, e.clientY - this.canvas.nativeElement.offsetTop);
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.lineCap = 'round';
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
    
    this.canvas.nativeElement.toBlob((blob) => {
      if (!blob) {
        this.error = 'Failed to capture canvas';
        this.isPredicting = false;
        return;
      }
      console.log('abc')
      const formData = new FormData();
      formData.append('file', blob, 'sketch.png');
      this.ngZone.run(() => {
        this.http.post<any>('/api/ai/quickdraw/detect', formData).subscribe({
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

  private uploadFile(file: Blob | File, filename: string): void {
    const form = new FormData();
    form.append('file', file, filename);

    this.http.post<any>('/api/ai/quickdraw/detect', form).subscribe({
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
