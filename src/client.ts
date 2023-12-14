import { ServerWebSocket } from "bun";
import { ElysiaWS } from "elysia/dist/ws";

export function open(ws: ElysiaWS<any>) {
	console.log("open");
}

export function message(ws: ElysiaWS<any>, msg: string) {
	console.log(msg);
}

export function close(ws: ElysiaWS<any>) {
	console.log("close");
}
