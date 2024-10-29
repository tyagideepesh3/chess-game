import { WebSocket } from "ws";
import { Game } from "./Game";
import { HandlerMessageTypeEnum } from "./enum";

export class GameManager {
  private games: Game[];
  private pendingUser: WebSocket | null;
  private users: WebSocket[];
  constructor() {
    this.games = [];
    this.users = [];
    this.pendingUser = null;
  }

  addUser(user: WebSocket) {
    this.users.push(user);
    this.addHandler(user);
  }
  removeUser(user: WebSocket) {
    this.users = this.users.filter((u) => u !== user);
  }
  private addHandler(socket: WebSocket) {
    socket.on("message", (data) => {
      const message = JSON.parse(data.toString());
      console.log("Received message:", message);
      if (
        message.type.toLowerCase().trim().toString() ===
        HandlerMessageTypeEnum.INIT_GMAE.toLowerCase().trim().toString()
      ) {
        if (this.pendingUser) {
          const game = new Game(this.pendingUser, socket);
          this.games.push(game);
          this.pendingUser = null;
        } else {
          this.pendingUser = socket;
        }
      } else if (
        message.type.toString().toLowerCase().trim() ===
        HandlerMessageTypeEnum.MOVE.toLowerCase().trim()
      ) {
        const game = this.games.find((g) => g.hasUser(socket));
        if (game) {
          game.makeMove(socket, message.move);
        } else {
          console.error("No game found for user", socket);
        }
      }
    });
  }
}
