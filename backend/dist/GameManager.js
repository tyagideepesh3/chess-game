"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const Game_1 = require("./Game");
const enum_1 = require("./enum");
class GameManager {
    constructor() {
        this.games = [];
        this.users = [];
        this.pendingUser = null;
    }
    addUser(user) {
        this.users.push(user);
        this.addHandler(user);
    }
    removeUser(user) {
        this.users = this.users.filter((u) => u !== user);
    }
    addHandler(socket) {
        socket.on("message", (data) => {
            const message = JSON.parse(data.toString());
            console.log("Received message:", message);
            if (message.type.toLowerCase().trim().toString() ===
                enum_1.HandlerMessageTypeEnum.INIT_GMAE.toLowerCase().trim().toString()) {
                console.log(this.pendingUser);
                if (this.pendingUser) {
                    const game = new Game_1.Game(this.pendingUser, socket);
                    this.games.push(game);
                    this.pendingUser = null;
                }
                else {
                    this.pendingUser = socket;
                }
            }
            else if (message.type.toString().toLowerCase().trim() ===
                enum_1.HandlerMessageTypeEnum.MOVE.toLowerCase().trim()) {
                const game = this.games.find((g) => g.hasUser(socket));
                if (game) {
                    game.makeMove(socket, message.move);
                }
                else {
                    console.error("No game found for user", socket);
                }
            }
        });
    }
}
exports.GameManager = GameManager;
