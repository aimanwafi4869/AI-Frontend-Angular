import { Injectable, Component } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject } from 'rxjs';
import { ChessService } from './chess-service.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chess-ui',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chess-ui.component.html',
  styleUrl: './chess-ui.component.scss'
})
@Injectable({ providedIn: 'root' })
export class ChessUiComponent {
  latestFrame: string = '';
  currentFen: string = '';

  constructor(private chessService: ChessService) {
    this.chessService.stream$.subscribe(data => {
      this.latestFrame = data.image;
      this.currentFen = data.fen;
    });
  }
}
