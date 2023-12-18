import Player from "./player";

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

		console.log("[GAME] Starting game");

		this.startGame();
	}

	removePlayer(player: Player) {
		this.players = this.players.filter(p => p.id !== player.id);
	}

	async ensureReady() {
		this.broadcast("isready");

		while (!this.players.every(player => player.isReady)) {
			await new Promise(resolve => setTimeout(resolve, 100));
		}

		console.log("[GAME] Players are ready");
	}

	async startGame() {
		await this.ensureReady();

		this.players.forEach((player, index) => {
			player.getFullPosition = () => {
				return `${player.position} : ${
					this.players[1 - index].position
				}`;
			};
		});
	}

	async calculationLoop() {
		let interrupt = false;

		for (const player of this.players) {
			player.onMove = () => {
				if (player.hasLost) {
					interrupt = true;
				}

				player.startCalculation();
			};

			player.startCalculation();
		}

		while (!interrupt) {
			await new Promise(resolve => setTimeout(resolve, 100));
		}
	}

	broadcast(msg: string) {
		this.players.forEach(player => {
			player.send(msg);
		});
	}
}
