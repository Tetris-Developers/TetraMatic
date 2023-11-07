from statemachine import StateMachine, State

class ServerStateMachine(StateMachine):
    lobby = State(initial=True)

    in_round = State()

    results = State()

    start_game = lobby.to(in_round, cond="both_players_ready")

    next_round = start_game | in_round.to(in_round)

    end_game = in_round.to(results, cond="game_ended")
    restart_game = results.to(lobby, cond="results_ok")

    def __init__(self, ft):
        super().__init__()

        self.score = [0, 0]
        self.ft = ft
        self.players: list[PlayerStateMachine] = []

    def add_player(self, player):
        if len(self.players) >= 2:
            print("[PLAYER REJECTED]")
            return

        self.players.add(player)

    def game_ended(self):
        return self.score[0] == self.ft or self.score[1] == self.ft

    def both_players_ready(self):
        if len(self.players) != 2:
            return False
        
        for player in self.players:
            if player.state != PlayerStateMachine.ready:
                return False

        return True
    
    def results_ok(self):
        return True
    
    def on_next_round(self):
        for player in self.players:
            player.set_position(None)
    
class GameStateMachine(StateMachine):
    waiting = State(initial=True)
    in_round = State()
    ended = State()

    start_game = waiting.to(in_round)
    next_round = start_game | in_round.to(in_round)
    end_game = in_round.to(ended, cond="all_rounds_ended")

    def all_rounds_ended(self):
        return self.score[0] == self.ft or self.score[1] == self.ft
    
    def set_players(self, players):
        self.players = tuple(players)

    def on_next_round(self):
        for player in self.players:
            player.set_position(None)
        

class PlayerStateMachine(StateMachine):
    not_ready = State(initial=True)
    ready = State()
    calculating = State()
    waiting = State()

    gets_ready = not_ready.to(ready)
    calculates = ready.to(calculating)
    done_calculating = calculating.to(waiting)
    next_piece = waiting.to(calculating)
    end_round = waiting.to(ready)

    def __init__(self):
        super().__init__()
        self.position = None

    def set_position(self, position):
        self.position = position
