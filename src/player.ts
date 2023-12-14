import { ElysiaWS } from "elysia/dist/ws";
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
	private ws: ElysiaWS<any, any, any>;
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

	public isReady = false;
	constructor(ws: ElysiaWS<any, any, any>) {
		this.ws = ws;
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
	sendRules() {
		this.ws.send(`rules ${rulesString}`);
	}

	async calculate(fullPosition: string) {
		this.ws.send(`start position ${fullPosition}`);	
		setTimeout(() => {this.ws.send("play")}, 1000 / rules.pps);
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
	}

	command(msg: string) {
		console.log(msg);
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
