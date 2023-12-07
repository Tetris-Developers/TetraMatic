import { cp } from "fs";
import { pieceMatrices } from "./consts.json"

enum Piece {
    J = 1,
    L = 2,
    O = 3,
    S = 4,
    T = 5,
    Z = 6,
    I = 7,
    Garbage = 8,
    Empty = 0,
}

enum Rotation {
    North = 0,
    East = 1,
    South = 2,
    West = 3,
}

enum Spin {
    None = 0,
    Mini = 1,
    Full = 2,
}

function charToPiece(char: string): Piece {
    switch (char) {
        case "J":
            return Piece.J;
        case "L":
            return Piece.L;
        case "O":
            return Piece.O;
        case "S":
            return Piece.S;
        case "T":
            return Piece.T;
        case "Z":
            return Piece.Z;
        case "I":
            return Piece.I;
        case "G":
            return Piece.Garbage;
        default:
            return Piece.Empty;
    }
}

function pieceToChar(piece: Piece): string | null {
    switch (piece) {
        case Piece.J:
            return "J";
        case Piece.L:
            return "L";
        case Piece.O:
            return "O";
        case Piece.S:
            return "S";
        case Piece.T:
            return "T";
        case Piece.Z:
            return "Z";
        case Piece.I:
            return "I";
        case Piece.Garbage:
            return "G";
        default:
            return null;
    }
}

function charToRotation(char: string): Rotation {
    switch (char) {
        case "north":
            return Rotation.North;
        case "east":
            return Rotation.East;
        case "south":
            return Rotation.South;
        case "west":
            return Rotation.West;
        default:
            return Rotation.North;
    }
}

function rotationToChar(rotation: Rotation): string {
    switch (rotation) {
        case Rotation.North:
            return "north";
        case Rotation.East:
            return "east";
        case Rotation.South:
            return "south";
        case Rotation.West:
            return "west";
    }
}

function charToSpin(char: string): Spin {
    switch (char) {
        case "none":
            return Spin.None;
        case "mini":
            return Spin.Mini;
        case "full":
            return Spin.Full;
        default:
            return Spin.None;
    }
}

function spinToChar(spin: Spin): string {
    switch (spin) {
        case Spin.None:
            return "none";
        case Spin.Mini:
            return "mini";
        case Spin.Full:
            return "full";
    }
}

export class Board {
    private board = new Array(20).fill(0).map(() => new Array(10).fill(Piece.Empty));
    private hold: Piece;
    private next: Piece[] = [];
    private incomingGarbage: number[] = [];
    private combo = 0;
    private backToBack = 0;

    hasLost = false;

    constructor(
        boardArray: Piece[][] = new Array(20).fill(0).map(() => new Array(10).fill(Piece.Empty)),
        hold: Piece = Piece.Empty,
        next: Piece[] = [],
        incomingGarbage: number[] = [],
        combo: number = 0,
        backToBack: number = 0
    ) {
        this.board = boardArray;
        this.hold = hold;
        this.next = next;
        this.incomingGarbage = incomingGarbage;
        this.combo = combo;
        this.backToBack = backToBack;
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
                currentRank.push(charToPiece(char));
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

        const holdPiece = charToPiece(getValue(split, "hold") || "Empty");

        const nextPiecesStr = getValue(split, "next");
        const nextPieces = nextPiecesStr?.split("").map(charToPiece) || [];

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

                if (block === 0) {
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

                result += pieceToChar(block);
            }

            if (emptyBlockCount > 0) {
                result += emptyBlockCount.toString();
                emptyBlockCount = 0;
            }

            result += "/";
        }

        if (this.hold != Piece.Empty) {
            result += ` hold ${pieceToChar(this.hold)}`;
        }
        if (this.next.length > 0) {
            result += ` next ${this.next.map(pieceToChar).join("")}`;
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

    push(move: Move, ignoreNext: boolean): boolean {
        const matrix: number[][] = pieceMatrices[move.type - 1][move.rotation];

        const { x, y } = move.coords;

        let willFall = true;

        for (const mino of matrix) {
            const ax = mino[0];
            const ay = mino[1];

            if (x + ax < 0 || x + ax >= 10 || y + ay >= 20) {
                return false;
            }

            if (y + ay < 0) {
                this.hasLost = true;
                return true;
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

        for (const mino of matrix) {
            const [ax, ay] = mino;
            this.board[y + ay][x + ax] = move.type;
        }

        if (!ignoreNext) {
            this.changeNextFromMove(move);
        }

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
            if (this.board[y].some((x) => x === 0)) {
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
                newGarbageQueue = [totalAdded - 8, ...this.incomingGarbage.slice(i + 1)];
            }

            for (let _ = 0; _ < num; _++) {
                if (this.board[0].some(x => x !== 0)) {
                    this.hasLost = true;
                    return;
                }

                this.board.shift();
                this.board.push(
                    Array(10).fill(Piece.Garbage).map(
                        (x, index) => index === hole ? 0 : x
                    )
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
    coords: { x: number, y: number } = { x: 0, y: 0 };
    rotation = 0;
    spin = 0;

    constructor(
        type: Piece,
        coords: { x: number, y: number },
        rotation: Rotation,
        spin: Spin
    ) {
        this.type = type;
        this.coords = coords;
        this.rotation = rotation;
        this.spin = spin;
    }

    static fromString(string: string): Move | null {
        const REGEX = /[JLOSTZI]\s+\d{1,2}\/\d{1,2}\s+(north|east|south|west)\s+(none|mini|full)/;
        if (!REGEX.test(string)) {
            return null;
        }

        const [pieceTypeStr, coordsStr, rotationStr, spinStr] = string.split(" ");

        const pieceType = charToPiece(pieceTypeStr);
        const coords = {
            x: Number(coordsStr.split("/")[0]),
            y: Number(coordsStr.split("/")[1])
        } as { x: number, y: number };
        const rotation = charToRotation(rotationStr);
        const spin = charToSpin(spinStr);

        return new Move(pieceType, coords, rotation, spin);
    }

    toString(): string {
        const pieceType = pieceToChar(this.type);
        const coords = `${this.coords.x}/${this.coords.y}`;
        const rotation = rotationToChar(this.rotation);
        const spin = spinToChar(this.spin);

        return `${pieceType} ${coords} ${rotation} ${spin}`;
    }
}