from flask import Flask
from flask_sock import Sock, ConnectionClosed
from src.session import Session
from simple_websocket import Client

app = Flask(__name__)
sock = Sock(app)
session = Session()


@sock.route("/bot")
def handle_bot_socket(ws: Client):
    """
    Starts a WebSocket connection for the "/bot" endpoint.

    :param ws: The WebSocket connection object.
    """

    player = session.add_player(ws)

    try:

        while True:
            message = ws.receive()
            player.handle_message(message)

    except ConnectionClosed:
        player.has_crashed = True
        print("Connection closed")


# Code for the spectator websocket
"""@app.websocket("/spectate")
async def handle_spectator(request, ws):
    ""   Starts a WebSocket connection for the "/spectator" endpoint.

    :param request: The incoming request object.
    :param ws: The WebSocket connection object.
    ""

    spectators.add(ws)
"""

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000)
