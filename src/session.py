from src.player import Player
from src.board import Board
from src.consts import CONFIG
from simple_websocket import Client, ConnectionClosed
from threading import Thread
from time import time_ns


class Session:
    def __init__(self):
        self.players: list[Player] = []

    def add_player(self, ws: Client) -> Player | None:

        if len(self.players) >= 2:
            ws.send("error too many players")
            ws.close()
            return

        player = Player(ws)

        self.players.append(player)

        if len(self.players) == 2:
            def safe_run():
                try:
                    self.run()
                except ConnectionClosed:
                    print("Connection closed")

            t = Thread(target=safe_run)
            t.start()

        return player

    def run(self):
        score = [0, 0]

        self.broadcast("isready")
        self.players[0].get_full_position = lambda: self.get_full_position()
        self.players[1].get_full_position = lambda: self.get_full_position()

        while not self.are_both_players_ready():
            pass

        def round_can_continue():
            any_player_lost = self.players[0].board.has_lost or self.players[1].board.has_lost
            someone_crashed = self.players[0].has_crashed or self.players[1].has_crashed
            return not (any_player_lost or someone_crashed)

        def play_round():
            print(f"[SERVER] Starting round {sum(score)}")

            self.players[0].start_calculating()
            self.players[1].start_calculating()

            while round_can_continue():
                pass

            if self.players[0].board.has_lost:
                score[1] += 1
            elif self.players[1].board.has_lost:
                score[0] += 1
            elif self.players[0].has_crashed:
                score[1] += 1
            elif self.players[1].has_crashed:
                score[0] += 1

        while not score[0] == CONFIG["rules"]["first-to"] and not score[1] == CONFIG["rules"]["first-to"]:
            play_round()

    def get_full_position(self):
        return f'{self.players[0].board} : {self.players[1].board}'

    def broadcast(self, message: str):
        for player in self.players:
            player.ws.send(message)

    def are_both_players_ready(self):
        return self.players[0].is_ready and self.players[1].is_ready
