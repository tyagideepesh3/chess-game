import { Chess } from "chess.js";
import { WebSocket } from "ws";
import { HandlerMessageTypeEnum } from "./enum";

export class Game {
  private player1: WebSocket;
  private player2: WebSocket;
  private board: Chess;
  private moves: string[];
  private startTime: string;
  constructor(player1: WebSocket, player2: WebSocket) {
    this.player1 = player1;
    this.player2 = player2;
    this.moves = [];
    this.board = new Chess();
    this.startTime = Date();
    console.log(player1, player2);
    this.player1.send(
      JSON.stringify({
        type: HandlerMessageTypeEnum.INIT_GMAE,
        payload: {
          color: "white",
        },
      })
    );
    this.player2.send(
      JSON.stringify({
        type: HandlerMessageTypeEnum.INIT_GMAE,
        payload: {
          color: "black",
        },
      })
    );
  }

  makeMove(socket: WebSocket, move: { from: string; to: string }) {
    if (this.board.turn() === "w" && this.player1 !== socket) {
      return;
    }
    if (this.board.turn() === "b" && this.player2 !== socket) {
      return;
    }
    try {
      const moveMade = this.board.move(move);
      if (moveMade === null || moveMade === undefined) {
        throw new Error("Invalid move");
      }
      if (this.board.isGameOver()) {
        this.player1.emit(
          JSON.stringify({
            type: HandlerMessageTypeEnum.GAME_OVER.toString().toUpperCase(),
            gameResult: this.getGameOverReason(),
          })
        );
        return;
      }
      if (this.board.turn() === "w") {
        this.player1.send(
          JSON.stringify({ type: HandlerMessageTypeEnum.MOVE, payload: move })
        );
      } else {
        this.player2.send(
          JSON.stringify({ type: HandlerMessageTypeEnum.MOVE, payload: move })
        );
      }
    } catch (err) {
      console.log(err);
    }
  }

  hasUser(socket: WebSocket) {
    if (socket === this.player1 || socket === this.player2) {
      return true;
    }
    return false;
  }
  private getGameOverReason() {
    if (!this.board.isGameOver()) {
      return "Game is still in progress";
    }
    if (this.board.isCheckmate()) {
      return "Checkmate";
    }
    if (this.board.isStalemate()) {
      return "Stalemate";
    }
    if (this.board.isInsufficientMaterial()) {
      return "Insufficient material";
    }
    if (this.board.isThreefoldRepetition()) {
      return "Threefold repetition";
    }
    if (this.board.isDraw()) {
      return "Draw";
    }
    return "Unknown";
  }
}
