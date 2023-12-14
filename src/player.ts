import { ElysiaWS } from "elysia/dist/ws";

export default class Player {
	private ws: ElysiaWS<any, any, any>;
	constructor(ws: ElysiaWS<any, any, any>) {
		this.ws = ws;
	}

	get id() {
		return this.ws.id;
	}

	command(msg: string) {
		console.log(msg);
		let argv = msg.split(" ");
		let command = argv.shift();

		switch (command) {
			case "info":
				console.log("infoooo");
				break;
			case "readyok":
				break;

			case "suggestion":
				break;
			case "bestmove":
				break;

			case "quit":
				break;
			case "crash":
				break;
		}
	}
}
