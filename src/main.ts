import express from "express";
import expressWs from "express-ws";
import { v4 as uuid } from "uuid";

import Player from "./player";
import Game from "./game";

const game = new Game();
const debugMode = process.argv.includes("--debug");

const { app } = expressWs(express());

app.ws("/bot", (ws: WebSocket, _) => {
	let player = new Player(ws, uuid());
	game.addPlayer(player);

	console.log("[SERVER] New client connected");

	if (debugMode) {
		console.log("[DEBUG] Players: " + game.playersCount);
	}

	ws.addEventListener("message", message => {
		if (debugMode) {
			console.log(
				`[DEBUG] Message from: ${player.id.split("-")[0]
				}: ${message.data.toString()}`
			);
		}

		player.command(message.data.toString());
	});

	ws.addEventListener("close", () => {
		game.removePlayer(player);

		if (debugMode) {
			console.log("[DEBUG] Players: " + game.playersCount);
		}
	});
});

app.listen(3000);
