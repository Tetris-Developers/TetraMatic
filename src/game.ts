import Player from "./player";
import * as console from "./logging";
import { rules } from "../config.json";

export default class Game {
	private players: Player[] = [];
	private score: [number, number] = [0, 0];

	get playersCount() {
		return this.players.length;
	}

	addPlayer(player: Player) {
		if (this.players.length >= 2) {
			player.crash("too-many-players");
			return;
		}

		this.players.push(player);

		if (this.players.length < 2) {
			return;
		}

		console.game("Starting game");

		this.startGame();
	}

	removePlayer(player: Player) {
		this.players = this.players.filter(p => p.id !== player.id);

		if (this.players.length == 0) {
			console.warn("No more players, resetting game");
			console.warn(`Score was ${this.score.join("-")}`);
			this.score = [0, 0];
		}
	}

	async ensureReady(): Promise<boolean> {
		// We wait for a second before sending "isready"
		// Testing showed that otherwise the message could get lost
		await new Promise(resolve => setTimeout(resolve, 1000));

		this.broadcast("isready");

		while (!this.players.every(player => player.isReady)) {
			await new Promise(resolve => setTimeout(resolve, 100));
		}

		if (this.players.length < 2) {
			console.error("Not enough players");
			return false;
		} else {
			console.game("Players are ready");
			return true;
		}
	}

	async startGame() {
		if (!(await this.ensureReady())) {
			console.game("Aborting game");
			// TODO: Cleaner game abort
			return;
		}

		this.players.forEach((player, index) => {
			player.getFullPosition = () => {
				return `${player.position} : ${
					this.players[1 - index].position
				}`;
			};
		});

		while (this.score[0] < rules.firstTo && this.score[1] < rules.firstTo) {
			console.game(
				`Starting Round: ${this.score[0] + this.score[1] + 1}`
			);
			this.players.forEach(player => player.resetBoard());
			await this.calculationLoop();
		}

		console.game(
			`Game ended: winner is ${this.players[0].id.split("-")[0]}`
		);
		console.game(`Score is ${this.score.join("-")}`);

		this.broadcast("quit");
	}

	async calculationLoop() {
		let winnerIndex = -1;
		let interrupt = false;

		for (const [index, player] of this.players.entries()) {
			player.onMove = () => {
				if (player.hasLost) {
					if (!interrupt) {
						winnerIndex = 1 - index;
					}
					interrupt = true;
				}

				player.startCalculation();
			};

			player.startCalculation();
		}

		while (!interrupt) {
			await new Promise(resolve => setTimeout(resolve, 100));
		}

		this.broadcast("stop");

		this.players.forEach(player => {
			player.onMove = () => {};
		});

		console.game("Round ended");
		this.score[winnerIndex] += 1;
	}

	broadcast(msg: string) {
		this.players.forEach(player => {
			player.send(msg);
		});
	}
}
