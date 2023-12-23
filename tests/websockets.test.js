import { describe, expect, test } from "bun:test";
import { WebSocket } from "ws";
import { pieceMatrices } from "../src/consts.json";
import { Board, Move } from "../src/board";

/**
 * @param {Board} board - description of parameter
 * @param {number[][]} matrix - description of parameter
 */
function harddrop(board) {
	let y = 19;
	let piece = board.next[0];
	let m = null;
	while (true) {
		m = new Move(piece, { x: 3, y }, 0, 0);
		if (!board.isLosingMove(m) && !board.isLegal(m)) {
			y--;
		} else {
			break;
		}
	}

	return m;
}

const charToPiece = new Map([
	["J", 0],
	["L", 1],
	["O", 2],
	["S", 3],
	["T", 4],
	["Z", 5],
	["I", 6],
	["G", 7]
]);

describe("WebSockets", async () => {
	test("Sample-game", async () => {
		const ws1 = new WebSocket("ws://localhost:3000/bot");
		const ws2 = new WebSocket("ws://localhost:3000/bot");

		let bestmove = null;

		function createClientOnMessage(ws) {
			ws.onmessage = msg => {
				if (msg.data == "isready") {
					ws1.send("readyok");
					ws2.send("readyok");
				}

				if (msg.data.split(" ")[0] == "start") {
					const piece = msg.data.split(" ")[4][0];

					const board = Board.fromString(
						msg.data.split(" ").slice(2, 5).join(" ")
					);

					bestmove = harddrop(
						board,
						pieceMatrices[charToPiece.get(piece)][0]
					);
				}

				if (msg.data.split(" ")[0] == "play") {
					ws.send("bestmove " + bestmove.toString());
				}

				if (msg.data.split(" ")[0] == "quit") {
					ws.close();
				}
			};
		}

		createClientOnMessage(ws1);
		createClientOnMessage(ws2);

		ws1.send("info name test1 version 1.0.0 author Cankyre");
		ws2.send("info name test2 version 1.0.0 author Cankyre");

		await new Promise(resolve => setTimeout(resolve, 100000));
	});
});
