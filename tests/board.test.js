import { expect, test } from "bun:test";
import { Board, Move } from "../src/board.js";

test("Boards Strings", () => {
    const string1 = "././././././././././././././././././././ next IJSTLZ";
    const string2 = "./././././././././././././././././5SS3/4SS4/3IIII3/ hold J next STLZOS";
    const string3 = "./././././././././././././././././5SS3/4SS4/3IIII3/ hold J next STLZOS incoming 3,1,1";
    const string4 = "././././././././././././././././5SS3/4SS4/3IIII3/ hold J next STLZOS b2b 2";
    const string5 = "././././././././././././././././5SS3/4SS4/3IIII3/ hold J next STLZOS combo 3";
    const string6 = "././././././././././././././././5SS3/4SS4/3IIII3/ hold J next STLZOS incoming 3,1,1 b2b 2 combo 3";

    expect(new Board().toString().split(" ")[0]).toBe(
        "././././././././././././././././././././"
    )

    const board1 = Board.fromString(string1);
    expect(board1.toString()).toBe(string1);

    const board2 = Board.fromString(string2);
    expect(board2.toString()).toBe(string2);

    const board3 = Board.fromString(string3);
    expect(board3.toString()).toBe(string3);

    const board4 = Board.fromString(string4);
    expect(board4.toString()).toBe(string4);

    const board5 = Board.fromString(string5);
    expect(board5.toString()).toBe(string5);

    const board6 = Board.fromString(string6);
    expect(board6.toString()).toBe(string6);
});

test("Move Strings", () => {
    // Valid Move strings
    const validMoveStrings = [
        "I 3/4 north none",
        "O 5/6 south mini",
        "T 2/7 east full",
        "J 1/3 west none",
        "L 8/9 south mini"
    ];

    for (const moveString of validMoveStrings) {
        const move = Move.fromString(moveString);
        expect(move.toString()).toBe(moveString);
    }

    // Invalid Move strings
    const invalidMoveStrings = [
        "I 3/4 0",
        "O 5/6 mini",
        "T 2/7 full",
        "J 1/3 none",
        "L 8/9 0 mini extra"
    ];

    for (const moveString of invalidMoveStrings) {
        const move = Move.fromString(moveString);
        expect(move).toBeNull();
    }
});

test("Push Valid Move 1", () => {
    const board = new Board();
    const move = new Move(1, { x: 3, y: 19 }, 0, 0);

    expect(board.push(move, true)).toBe(true);
    expect(board.board).toEqual(
        Array(18).fill(Array(10).fill(0))
            .concat([
                [0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 1, 1, 0, 0, 0, 0, 0]
            ])
    );
    expect(board.hold).toBe(0);
    expect(board.next).toEqual([]);
    expect(board.incomingGarbage).toEqual([]);
    expect(board.combo).toBe(0);
    expect(board.backToBack).toBe(0);
    expect(board.hasLost).toBe(false);
});

test("Push Valid Move 2", () => {
    const move = new Move(7, { x: 3, y: 18 }, 0, 0);
    const board = Board.fromString("./././././././././././././././././././3IIII3/ hold J next ITLZOS");

    expect(board.push(move)).toBe(true);
    expect(board.board).toEqual(
        Array(17).fill(Array(10).fill(0))
            .concat([
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 7, 7, 7, 7, 0, 0, 0, 0],
                [0, 0, 0, 7, 7, 7, 7, 0, 0, 0]
            ])
    );
    expect(board.hold).toBe(1);
    expect(board.next.length).toBe(6);
    expect(board.next[0]).toBe(5);
});

test("Push From Hold", () => {
    const move = new Move(1, { x: 6, y: 18 }, 2, 0);
    const board = Board.fromString("./././././././././././././././././././3IIII3/ hold J next ITLZOS");

    expect(board.push(move)).toBe(true);
    expect(board.hold).toBe(7);
    expect(board.next.length).toBe(6);
});

test("Push Invalid Move: Falling", () => {
    const move = new Move(7, { x: 3, y: 3 }, 0, 0);
    const board = Board.fromString("./././././././././././././././././././3IIII3/ hold J next ITLZOS");

    expect(board.push(move)).toBe(false);
    expect(board.toString()).toBe("./././././././././././././././././././3IIII3/ hold J next ITLZOS");
});

test("Push Invalid Move: Out of Bounds", () => {
    const move = new Move(7, { x: 3, y: 20 }, 0, 0);
    const board = Board.fromString("././././././././././././././././././3IIII3/ hold J next ITLZOS");

    expect(board.push(move)).toBe(false);
    expect(board.toString()).toBe("././././././././././././././././././3IIII3/ hold J next ITLZOS");
})

test('Clear lines: Empty Board', () => {
    const board = Board.fromString("./././././././././././././././././././3IIII3/ hold J next ITLZOS");
    expect(board.clearLines()).toBe(0);
    expect(board.toString()).toBe("./././././././././././././././././././3IIII3/ hold J next ITLZOS");
});

test('Clear lines: Single Line', () => {
    const board = Board.fromString("./././././././././././././././././././IIIIIIIIIII/ hold J next ITLZOS");
    expect(board.clearLines()).toBe(1);
    expect(board.toString()).toBe("././././././././././././././././././././ hold J next ITLZOS combo 1");
});

test('Clear lines: Multiple Lines', () => {
    const board = Board.fromString("./././././IIIIIIIIII/././././././././././././JJJJJJJJJJ/3IIII3/ hold J next ITLZOS");
    expect(board.clearLines()).toBe(2);
    expect(board.toString()).toBe("./././././././././././././././././././3IIII3/ hold J next ITLZOS combo 1");
});

test('Garbage test: No loss', () => {
    const board = new Board();
    board.incomingGarbage = [1, 2, 1];
    board.addGarbage();

    for (let i = 16; i < 20; i++) {
        expect(board.board[i].reduce((sum, val) => sum + val)).toBe(8 * 9);
    }
});

test('Garbage test: Loss', () => {
    const board = new Board();
    board.incomingGarbage = [3, 2, 1];
    board.board = Array(18).fill(Array(10).fill(8)).concat(Array(2).fill(Array(10).fill(0)));
    board.addGarbage();

    expect(board.hasLost).toBe(true);
});

test('Test Garbage: Capped', () => {
    const board = new Board();
    board.incomingGarbage = [6, 8, 3, 2];
    board.addGarbage();

    for (let i = 0; i < 12; i++) {
        expect(board.board[i].reduce((sum, val) => sum + val)).toBe(0);
    }

    for (let i = 12; i < 20; i++) {
        expect(board.board[i].reduce((sum, val) => sum + val)).toBe(8 * 9);
    }

    expect(board.incomingGarbage).toEqual([6, 3, 2]);
});