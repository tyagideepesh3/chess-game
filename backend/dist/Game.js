"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const enum_1 = require("./enum");
class Game {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.moves = [];
        this.board = new chess_js_1.Chess();
        this.startTime = Date();
        console.log(player1, player2);
        this.player1.send(JSON.stringify({
            type: enum_1.HandlerMessageTypeEnum.INIT_GMAE,
            payload: {
                color: "white",
            },
        }));
        this.player2.send(JSON.stringify({
            type: enum_1.HandlerMessageTypeEnum.INIT_GMAE,
            payload: {
                color: "black",
            },
        }));
    }
    makeMove(socket, move) {
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
                this.player1.emit(JSON.stringify({
                    type: enum_1.HandlerMessageTypeEnum.GAME_OVER.toString().toUpperCase(),
                    gameResult: this.getGameOverReason(),
                }));
                return;
            }
            if (this.board.turn() === "w") {
                this.player1.send(JSON.stringify({ type: enum_1.HandlerMessageTypeEnum.MOVE, payload: move }));
            }
            else {
                this.player2.send(JSON.stringify({ type: enum_1.HandlerMessageTypeEnum.MOVE, payload: move }));
            }
        }
        catch (err) {
            console.log(err);
        }
    }
    hasUser(socket) {
        if (socket === this.player1 || socket === this.player2) {
            return true;
        }
        return false;
    }
    getGameOverReason() {
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
exports.Game = Game;
