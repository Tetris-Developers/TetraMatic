import express from "express";
import expressWs from "express-ws";
import { v4 as uuid } from "uuid";

import Player from "./player";
import Game from "./game";

import * as console from "./logging";

const game = new Game();
const debugMode = process.argv.includes("--debug");

const { app } = expressWs(express());

app.ws("/bot", (ws: WebSocket, _) => {
	let player = new Player(ws, uuid());

	console.server(`${player.id.split("-")[0]} connected`);

	game.addPlayer(player);

	if (debugMode) {
		console.debug("Players: " + game.playersCount);
	}

	ws.addEventListener("message", message => {
		if (debugMode) {
			console.debug(`Message from: ${player.id.split("-")[0]
				}: ${message.data.toString()}`
			);
		}

		player.command(message.data.toString());
	});

	ws.addEventListener("close", () => {
		console.server(`${player.id.split("-")[0]} disconnected`);
		game.removePlayer(player);

		if (debugMode) {
			console.debug("Players: " + game.playersCount);
		}
	});
});

app.listen(3000);
