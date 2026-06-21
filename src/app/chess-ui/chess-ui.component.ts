import { CommonModule } from '@angular/common';
import { Component, Injectable, Input } from '@angular/core';
import { ChessService } from './chess-service.component';

interface ChessSquare {
  coordinate: string; // e.g., "a8", "h1"
  isLight: boolean;
  symbol: string;     // e.g., "♜", "♙", or ""
}

@Component({
  selector: 'app-chess-ui',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chess-ui.component.html',
  styleUrl: './chess-ui.component.scss'
})

@Injectable({ providedIn: 'root' })
export class ChessUiComponent {
  private _fen: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
  squares: ChessSquare[] = [];
  currentFen: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
  currentMove = ''
  private files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  
  // Unicode map for crisp, asset-free chess pieces
  private pieceMap: { [key: string]: string } = {
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟', // Black pieces
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙'  // White pieces
  };
  constructor(private chessService: ChessService) {
      this.chessService.stream$.subscribe(data => {
        // this.latestFrame = data.image;
        this.currentFen = data.fen;
        this.currentMove = data.move;
        this.generateBoardFromFen(this.currentFen)
      });
    }


  private generateBoardFromFen(fenString: string): void {
    this.squares = [];
    
    const boardLayout = fenString.split(' ')[0];
    const ranks = boardLayout.split('/');

    for (let r = 0; r < 8; r++) {
      const currentRank = ranks[r];
      let fileIndex = 0;

      for (const char of currentRank) {
        if (!isNaN(Number(char))) {
          const emptySquares = parseInt(char, 10);
          for (let i = 0; i < emptySquares; i++) {
            this.pushSquare(r, fileIndex, '');
            fileIndex++;
          }
        } else {
          this.pushSquare(r, fileIndex, this.pieceMap[char] || '');
          fileIndex++;
        }
      }
    }
  }

  private pushSquare(rankIndex: number, fileIndex: number, pieceSymbol: string): void {
    const file = this.files[fileIndex];
    const rank = 8 - rankIndex;
    
    const isLight = (rankIndex + fileIndex) % 2 === 0;

    this.squares.push({
      coordinate: `${file}${rank}`,
      isLight: isLight,
      symbol: pieceSymbol
    });
  }
}