import { rules } from "../config.json";

import { Board, Move } from "./board";
import * as console from "./logging";

const debugMode = process.argv.includes("--debug");

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
		if (debugMode) {
			console.debug(
				`Message to ${this.id.split("-")[0]}: ${
					msg.length > 15 ? msg.slice(0, 15) + "..." : msg
				}`
			);
		}

		this.ws.send(msg);
	}

	crash(msg: string) {
		this.send(`error ${msg}`);
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
		this.send(`rules ${rulesString}`);
	}

	resetBoard() {
		this.board = new Board();
	}

	startCalculation() {
		const fullPosition = this.getFullPosition();

		this.send(`start position ${fullPosition}`);
		setTimeout(() => {
			this.send("play");
		}, 1000 / rules.pps);
	}

	illegalMoveProcedure() {
		if (debugMode) {
			console.debug(`Illegal move by ${this.id.split("-")[0]}`);
		}

		// TODO: Illegal move logic
	}

	playMove(move: Move | null) {
		if (move === null) {
			this.illegalMoveProcedure();
			return;
		}

		const hasPlayedSuccessfully = this.board.push(move);

		if (!hasPlayedSuccessfully) {
			this.illegalMoveProcedure();
		}
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
				this.send("quit ok");
				this.ws.close();
				break;
			case "crash":
				break;
			default:
				this.send("error invalid-command");
				break;
		}
	}
}
