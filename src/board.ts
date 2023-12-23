import { pieceMatrices } from "./consts.json";
import { rules } from "../config.json";

enum Piece {
	J = 1,
	L = 2,
	O = 3,
	S = 4,
	T = 5,
	Z = 6,
	I = 7,
	Garbage = 8,
	Empty = 0
}

enum Rotation {
	North = 0,
	East = 1,
	South = 2,
	West = 3
}

enum Spin {
	None = 0,
	Mini = 1,
	Full = 2
}

const charToPiece = new Map<string, Piece>([
	["J", Piece.J],
	["L", Piece.L],
	["O", Piece.O],
	["S", Piece.S],
	["T", Piece.T],
	["Z", Piece.Z],
	["I", Piece.I],
	["G", Piece.Garbage]
]);

const pieceToChar = new Map<Piece, string>(
	[...charToPiece.entries()].map(([k, v]) => [v, k])
);

const charToRotation = new Map<string, Rotation>([
	["north", Rotation.North],
	["east", Rotation.East],
	["south", Rotation.South],
	["west", Rotation.West]
]);

const rotationToChar = new Map<Rotation, string>(
	[...charToRotation.entries()].map(([k, v]) => [v, k])
);

const charToSpin: Map<string, Spin> = new Map([
	["none", Spin.None],
	["mini", Spin.Mini],
	["full", Spin.Full]
]);

const spinToChar: Map<Spin, string> = new Map([
	[Spin.None, "none"],
	[Spin.Mini, "mini"],
	[Spin.Full, "full"]
]);

export class Board {
	private board: Piece[][];
	private hold: Piece;
	private next: Piece[] = [];
	private incomingGarbage: number[] = [];
	private combo = 0;
	private backToBack = 0;

	public hasLost = false;

	constructor(
		boardArray?: Piece[][],
		hold: Piece = Piece.Empty,
		next: Piece[] = [],
		incomingGarbage: number[] = [],
		combo: number = 0,
		backToBack: number = 0
	) {
		this.board = boardArray || createEmptyBoard();

		function createEmptyBoard(): Piece[][] {
			return new Array(20)
				.fill(null)
				.map(() => new Array(10).fill(Piece.Empty));
		}

		this.hold = hold;
		this.next = next;
		this.incomingGarbage = incomingGarbage;
		this.combo = combo;
		this.backToBack = backToBack;

		this.fillQueue(rules.nextPieces);
	}

	static fromString(string: string): Board {
		const split = string.split(" ");

		const mainBoardString = split[0];

		let ranks: number[][] = [];
		let currentRank: number[] = [];

		for (const char of mainBoardString) {
			if (currentRank.length === 10) {
				ranks.push(currentRank);
				currentRank = [];
			}

			if (char === "/") {
				continue;
			}

			if (char === ".") {
				ranks.push(Array(10).fill(0));
				continue;
			}

			if (char.match(/\d/)) {
				currentRank.push(...Array(Number(char)).fill(0));
				continue;
			}

			if (char.match(/[JLOSTZIG]/)) {
				currentRank.push(charToPiece.get(char) || Piece.Empty);
				continue;
			}
		}

		function getValue(split: string[], keyword: string): string | null {
			const index = split.indexOf(keyword);

			if (index !== -1) {
				return split[index + 1];
			}

			return null;
		}

		const holdPiece =
			charToPiece.get(getValue(split, "hold") || "Empty") || Piece.Empty;

		const nextPiecesStr = getValue(split, "next");
		const nextPieces =
			nextPiecesStr
				?.split("")
				.map(n => charToPiece.get(n) || Piece.Empty) || [];

		const incomingStr = getValue(split, "incoming");
		const incoming = incomingStr?.split(",").map(i => parseInt(i)) || [];

		const b2b = parseInt(getValue(split, "b2b") || "0");
		const combo = parseInt(getValue(split, "combo") || "0");

		return new Board(ranks, holdPiece, nextPieces, incoming, combo, b2b);
	}

	toString(): string {
		let result = "";
		let emptyBlockCount = 0;

		for (let i = 0; i < this.board.length; i++) {
			const rank = this.board[i];

			for (let j = 0; j < rank.length; j++) {
				const block = rank[j];

				if (block === Piece.Empty) {
					emptyBlockCount += 1;

					if (emptyBlockCount === 10) {
						result += ".";
						emptyBlockCount = 0;
						break;
					}

					continue;
				}

				if (emptyBlockCount > 0) {
					result += emptyBlockCount.toString();
					emptyBlockCount = 0;
				}

				result += pieceToChar.get(block) || " ";
			}

			if (emptyBlockCount > 0) {
				result += emptyBlockCount.toString();
				emptyBlockCount = 0;
			}

			result += "/";
		}

		if (this.hold != Piece.Empty) {
			result += ` hold ${pieceToChar.get(this.hold)}`;
		}
		if (this.next.length > 0) {
			result += ` next ${this.next
				.map(x => pieceToChar.get(x) || " ")
				.join("")}`;
		}
		if (this.incomingGarbage.length > 0) {
			result += ` incoming ${this.incomingGarbage.join(",")}`;
		}
		if (this.backToBack) {
			result += ` b2b ${this.backToBack}`;
		}
		if (this.combo) {
			result += ` combo ${this.combo}`;
		}

		return result;
	}

	isLosingMove(move: Move): boolean {
		const matrix: number[][] = pieceMatrices[move.type - 1][move.rotation];
		const { y } = move.coords;
		for (const mino of matrix) {
			const [_, ay] = mino;

			if (y + ay < 0) {
				return true;
			}
		}

		return false;
	}

	isLegal(move: Move): boolean {
		const matrix: number[][] = pieceMatrices[move.type - 1][move.rotation];
		const { x, y } = move.coords;

		let willFall = true;

		for (const mino of matrix) {
			const [ax, ay] = mino;

			if (x + ax < 0 || x + ax >= 10 || y + ay >= 20) {
				return false;
			}

			if (this.board[y + ay][x + ax] !== 0) {
				return false;
			}

			if (y + ay >= 19 || this.board[y + ay + 1][x + ax] !== 0) {
				willFall = false;
			}
		}

		if (willFall) {
			return false;
		}

		return true;
	}

	push(move: Move): boolean {
		if (this.isLosingMove(move)) {
			this.hasLost = true;
			return true;
		}

		if (!this.isLegal(move)) {
			return false;
		}

		const matrix: number[][] = pieceMatrices[move.type - 1][move.rotation];
		const { x, y } = move.coords;

		for (const mino of matrix) {
			const [ax, ay] = mino;
			this.board[y + ay][x + ax] = move.type;
		}

		this.changeNextFromMove(move);

		this.clearLines();

		return true;
	}

	fillQueue(numpieces: number = 6): void {
		while (this.next.length < numpieces) {
			// TODO 7-bag
			this.next.push(Math.ceil(Math.random() * 7));
		}
	}

	changeNextFromMove(move: Move): boolean {
		if (move.type === this.next[0]) {
			this.next.shift();
			this.fillQueue();
			return true;
		} else if (move.type === this.hold) {
			this.hold = this.next[0];
			this.next.shift();
			this.fillQueue();
			return true;
		}
		return false;
	}

	clearLines(dontCancelB2B: boolean = false): number {
		let cleared = 0;
		for (let y = 0; y < 20; y++) {
			if (this.board[y].some(x => x === 0)) {
				continue;
			}

			cleared += 1;
			for (let i = y; i > 0; i--) {
				this.board[i] = this.board[i - 1];
			}
			this.board[0] = Array(10).fill(0);
		}

		if (cleared === 0) {
			this.combo = 0;
		} else {
			this.combo += 1;
		}

		if (cleared === 4) {
			this.backToBack += 1;
		} else if (!dontCancelB2B && cleared > 0) {
			this.backToBack = 0;
		}

		return cleared;
	}

	addGarbage(): void {
		let totalAdded = 0;
		let newGarbageQueue: number[] = [];

		for (let i = 0; i < this.incomingGarbage.length; i++) {
			let num = this.incomingGarbage[i];
			let hole = Math.floor(Math.random() * 10);

			totalAdded += num;

			if (totalAdded > 8) {
				num -= totalAdded - 8;
				newGarbageQueue = [
					totalAdded - 8,
					...this.incomingGarbage.slice(i + 1)
				];
			}

			for (let _ = 0; _ < num; _++) {
				if (this.board[0].some(x => x !== 0)) {
					this.hasLost = true;
					return;
				}

				this.board.shift();
				this.board.push(
					Array(10)
						.fill(Piece.Garbage)
						.map((x, index) => (index === hole ? 0 : x))
				);
			}

			if (totalAdded > 8) {
				break;
			}
		}

		this.incomingGarbage = newGarbageQueue;
	}
}

export class Move {
	type: Piece;
	coords: { x: number; y: number } = { x: 0, y: 0 };
	rotation = 0;
	spin = 0;

	constructor(
		type: Piece,
		coords: { x: number; y: number },
		rotation: Rotation,
		spin: Spin
	) {
		this.type = type;
		this.coords = coords;
		this.rotation = rotation;
		this.spin = spin;
	}

	static fromString(string: string): Move | null {
		const REGEX =
			/[JLOSTZI]\s+\d{1,2}\/-?\d{1,2}\s+(north|east|south|west)\s+(none|mini|full)/;
		if (!REGEX.test(string)) {
			return null;
		}

		const [pieceTypeStr, coordsStr, rotationStr, spinStr] =
			string.split(" ");

		const pieceType = charToPiece.get(pieceTypeStr) || Piece.Empty;
		const coords = {
			x: Number(coordsStr.split("/")[0]),
			y: Number(coordsStr.split("/")[1])
		} as { x: number; y: number };
		const rotation = charToRotation.get(rotationStr) || 0;
		const spin = charToSpin.get(spinStr) || Spin.None;

		return new Move(pieceType, coords, rotation, spin);
	}

	toString(): string {
		const pieceType = pieceToChar.get(this.type);
		const coords = `${this.coords.x}/${this.coords.y}`;
		const rotation = rotationToChar.get(this.rotation);
		const spin = spinToChar.get(this.spin);

		return `${pieceType} ${coords} ${rotation} ${spin}`;
	}
}
