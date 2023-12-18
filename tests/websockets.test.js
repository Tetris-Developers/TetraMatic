import { describe, expect, test } from "bun:test";
import { WebSocket } from "ws";

describe("WebSockets", async () => {
	test("connection", async () => {
		const ws1 = new WebSocket("ws://localhost:3000/bot");
		const ws2 = new WebSocket("ws://localhost:3000/bot");

		ws1.send("info name 1");
		ws2.send("info name 1");
		ws1.onmessage = msg => {
			if (msg.data == "isready") {
				ws1.send("readyok");
			}
		};

		setTimeout(() => ws2.close(1000, "test"), 1000);
		setTimeout(() => ws1.close(1000, "test"), 2000);

		while (!ws1.isAlive || !ws2.isAlive) {
			await new Promise(resolve => setTimeout(resolve, 100));
		}
	}, 100000000000);
});
