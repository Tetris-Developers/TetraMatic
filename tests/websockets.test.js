import { main } from "../src/main";
import { describe, expect, test, beforeAll } from "bun:test";

describe("WebSockets", async () => {
	let app;

	beforeAll(async () => {
		app = await main();
	});

	test("connection", async () => {
		const ws = new WebSocket("ws://localhost:3000/bot");

		ws.on("open", () => {
			console.log("connected");
		});
	});
});
