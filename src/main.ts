import { Elysia, t } from "elysia";
import Player from "./player";
import { ElysiaWS } from "elysia/dist/ws";

function createClient() {
    let thisPlayer: Player;
	function open(ws: ElysiaWS<any, any, any>) {
        console.log("[SERVER] New client connected");
        thisPlayer = new Player(ws);
	}

	function message(_: ElysiaWS<any, any, any>, msg: string) {
        thisPlayer.command(msg);
	}

	function close(_: ElysiaWS<any, any, any>) {
        console.log("[SERVER] Client disconnected");
	}

	return {
		body: t.String(),
		open,
		message,
		close
	};
}

export function main() {
	const app = new Elysia();

	app.ws("/bot", createClient());

	return new Promise(resolve => {
		app.listen(Bun.env.PORT || 3000, () => {
			console.log("[INFO] Server running");
			resolve(app);
		});
	});
}

await main();
