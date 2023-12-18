import { rules } from "../config.json";

import { Board, Move } from "./board";

const rulesString = (() => {
	let string = "";
	for (const [key, value] of Object.entries(rules)) {
		string += `${key.replace(
			/[A-Z]/g,
			letter => `-${letter.toLowerCase()}`
		)} ${value} `;
	}
	return string;
})();

export default class Player {
	private ws: WebSocket;
	private infos: {
		name: string;
		version: string;
		author: string;
	} = {
		name: "",
		version: "",
		author: ""
	};
	private board = new Board();
	private hasPlayed = false;

	public id: string;
	public onMove: () => void = () => {};
	public getFullPosition: () => string = () => "";

	public isReady = false;
	constructor(ws: WebSocket, uuid: string) {
		this.ws = ws;
		this.id = uuid;
	}

	get position() {
		return this.board.toString();
	}

	send(msg: string) {
		this.ws.send(msg);
	}

	crash(msg: string) {
		this.ws.send(`error ${msg}`);
		this.ws.close();
	}

	set info(argv: string[]) {
		let parsedInfos = { name: "", version: "", author: "" };
		for (let i = 0; i < argv.length; i += 2) {
			let key = argv[i];
			let value = argv[i + 1];
			if (key === "name" || key === "version" || key === "author") {
				parsedInfos[key] = value;
			}
		}
		this.infos = parsedInfos;
	}

	get info(): { name: string; version: string; author: string } {
		return this.infos;
	}

	get hasLost() {
		return this.board.hasLost;
	}
	sendRules() {
		this.ws.send(`rules ${rulesString}`);
	}

	startCalculation() {
		const fullPosition = this.getFullPosition();

		this.ws.send(`start position ${fullPosition}`);
		setTimeout(() => {
			this.ws.send("play");
		}, 1000 / rules.pps);
	}

	async calculate(fullPosition: string) {
		this.ws.send(`start position ${fullPosition}`);

		return async () => {
			while (!this.hasPlayed) {
				await new Promise(resolve => setTimeout(resolve, 10));
			}

			this.hasPlayed = false;

			return true;
		};
	}

	playMove(move: Move | null) {
		if (move === null) {
			// TODO: Illegal move logic
			return;
		}

		const hasPlayedSuccessfully = this.board.push(move);

		// TODO: PPS Check

		if (!hasPlayedSuccessfully) {
			// TODO: Illegal move logic
		}

		this.hasPlayed = true;
	}

	command(msg: string) {
		let argv = msg.split(" ");
		let command = argv.shift();

		switch (command) {
			case "info":
				this.sendRules();
				this.info = argv;
				break;
			case "readyok":
				this.isReady = true;
				break;
			case "suggestion":
				break;
			case "bestmove":
				this.playMove(Move.fromString(argv.join(" ")));
				this.onMove();
				break;
			case "quit":
				this.ws.send("quit ok");
				this.ws.close();
				break;
			case "crash":
				break;
			default:
				this.ws.send("error invalid-command");
				break;
		}
	}
}
