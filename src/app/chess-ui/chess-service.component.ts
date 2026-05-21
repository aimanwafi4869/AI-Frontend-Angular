import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChessService {
  private socket = io('http://localhost:5000');
  public stream$ = new Subject<{image: string, fen: string}>();

  constructor() {
    this.socket.on('board_update', (data) => {
      this.stream$.next(data);
    });
  }
}