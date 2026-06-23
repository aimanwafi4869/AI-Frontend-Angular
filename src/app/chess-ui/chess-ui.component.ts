import { CommonModule } from '@angular/common';
import { Component, Injectable, Input, OnInit } from '@angular/core';
import { ChessService } from './chess-service.component';
import { HttpClient } from '@angular/common/http';

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
export class ChessUiComponent implements OnInit{
  private _fen: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
  squares: ChessSquare[] = [];
  currentFen: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
  currentMove = ''
  private files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  moveHistory: Array<{ moveNumber: number, white: string, black: string }> = [];
  private moveCounter = 1;
  // Unicode map for crisp, asset-free chess pieces
  private pieceMap: { [key: string]: string } = {
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟', // Black pieces
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙'  // White pieces
  };
  // constructor(private chessService: ChessService) {
  //     this.chessService.stream$.subscribe(data => {
  //       // this.latestFrame = data.image;
  //       this.currentFen = data.fen;
  //       this.currentMove = data.move;
  //       this.generateBoardFromFen(this.currentFen)
  //     });
  //   }

  constructor(private chessService: ChessService, private http: HttpClient) {
  this.chessService.stream$.subscribe(data => {
      if (data.move && data.move.length >= 4) {
        const fromSquare = data.move.substring(0, 2);
        const toSquare = data.move.substring(2, 4);
        const movingSquare = this.squares.find(s => s.coordinate === fromSquare);
        
        if (movingSquare && movingSquare.symbol) {
          let pieceName = this.getPieceName(movingSquare.symbol);
          const isWhite = this.getPieceName(movingSquare.symbol).startsWith('White');
          pieceName = pieceName.replace('White','')
          pieceName = pieceName.replace('Black','')
          pieceName = pieceName.replace('King','K')
          pieceName = pieceName.replace('Bishop','B')
          pieceName = pieceName.replace('Rook','R')
          pieceName = pieceName.replace('Pawn','P')
          pieceName = pieceName.replace('Knight','N')
          pieceName = pieceName.replace('Queen','Q')
          const descriptiveMove = `${pieceName}${toSquare}`;
          
          this.recordMove(descriptiveMove, isWhite);
        }
      }

      this.currentFen = data.fen;
      this.generateBoardFromFen(this.currentFen);
    });
  }

  ngOnInit(): void {
    this.generateBoardFromFen(this.currentFen)
  }


  resetGame(): void {
    this.moveHistory = [];
    this.moveCounter = 1;
    this.currentMove = '';
    this.currentFen = this.currentFen;
    
    this.generateBoardFromFen(this.currentFen);
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
  
  private getPieceName(symbol: string): string {
    const names: { [key: string]: string } = {
    '♚': 'King', '♛': 'Black Queen', '♜': 'Black Rook', '♝': 'Black Bishop', '♞': 'Black Knight', '♟': 'Black Pawn',
    '♔': 'White King', '♕': 'White Queen', '♖': 'White Rook', '♗': 'White Bishop', '♘': 'White Knight', '♙': 'White Pawn'
    };
    return names[symbol] || 'Piece';
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
  private recordMove(moveText: string, isWhite: boolean): void {
    if (isWhite) {
      // White starts a new move row
      this.moveHistory.push({
        moveNumber: this.moveCounter++,
        white: moveText,
        black: '' // Will be filled on next stream emit if it's Black
      });
    } else {
      // Black finishes the current move row
      if (this.moveHistory.length > 0) {
        this.moveHistory[this.moveHistory.length - 1].black = moveText;
      } else {
        // Fallback if stream starts on a black move
        this.moveHistory.push({ moveNumber: this.moveCounter, white: '...', black: moveText });
      }
    }
  }
}