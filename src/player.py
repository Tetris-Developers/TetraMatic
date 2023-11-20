from src.board import Board, Move
from simple_websocket import Client, ConnectionClosed
from time import time_ns
from enum import Enum

from src.consts import CONFIG

PlayerState = Enum("PlayerState", ["WAITING", "CALCULATING", "STOPPED"])


class Player():
    def __init__(self, ws: Client) -> None:
        self.get_full_position = lambda: ""
        self.time_last_move = time_ns()
        self.is_ready = False
        self.has_crashed = False
        self.ws = ws

        self.board = Board()

    def set_ready(self):
        self.is_ready = True
        self.state = PlayerState.WAITING

    def start_calculating(self):
        string = f"start position {self.get_full_position()}"
        self.ws.send(string)
        self.state = PlayerState.CALCULATING

    def send_illegal_move(self):
        # TODO send illegal penalties
        self.ws.send("illegal")
        self.state = PlayerState.STOPPED

    def send_rules(self):
        s = 'rules '
        for rule in CONFIG["rules"]:
            s += f"{rule} {CONFIG['rules'][rule]} "
        self.ws.send(s)

    def stop(self):
        self.state = PlayerState.STOPPED

    def play_move(self, move: Move):
        has_played_successfully = self.board.push(move)

        while time_ns() - self.time_last_move > 1000 / CONFIG["rules"]["pps"]:
            pass

        if has_played_successfully:
            self.time_last_move = time_ns()
            if self.board.has_lost:
                self.state = PlayerState.STOPPED
                return

            self.state = PlayerState.WAITING
        else:
            self.send_illegal_move(self.ws)

    def handle_message(self, message: str):
        words = message.split(" ")
        command = words[0]

        match command:
            case "info":
                self.send_rules()
            case "readyok":
                self.is_ready = True
                self.state = PlayerState.WAITING
            case "suggestion":
                pass
            case "bestmove":
                try:
                    move = Move.from_string(" ".join(words[1:]))
                except ValueError:
                    self.send_illegal_move()
                    return

                self.play_move(move)
                self.state = PlayerState.STOPPED

            case "quit":
                self.ws.send("quit ok")
                self.ws.close()
            case "crash":
                self.has_crashed = True

            case _:
                self.ws.send("error invalid command")

    def reset(self):
        self.board = Board()
        self.state = PlayerState.WAITING
