from sanic import Sanic

app = Sanic("TetraMatic")


@app.websocket("/bot")
async def handle_socket(request, ws):
    """
    Starts a WebSocket connection for the "/bot" endpoint.

    :param request: The incoming request object.
    :param ws: The WebSocket connection object.
    """
    await ws.accept()
    while True:
        data = await ws.recv()
        await ws.send(data)


# Code for the spectator websocket
@app.websocket("/spectate")
async def handle_spectator(request, ws):
    """
    Starts a WebSocket connection for the "/spectator" endpoint.

    :param request: The incoming request object.
    :param ws: The WebSocket connection object.
    """
    await ws.accept()
    while True:
        data = await ws.recv()
        await ws.send(data)


def main():
    app.run(port=8000)


if __name__ == "__main__":
    main()
