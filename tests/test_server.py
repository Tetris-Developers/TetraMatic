from simple_websocket import Client

# Import your server code

i = 0


def handle_command(message: str, ws: Client):

    words = message.split(" ")
    command = words[0]

    print(command)

    match command:
        case "isready":
            ws.send("readyok")

        case "start":
            ws.send("bestmove oaeufaeoufb")


def test_usual():
    global i
    bot = Client.connect("ws://127.0.0.1:5000/bot")
    bot2 = Client.connect("ws://127.0.0.1:5000/bot")

    bot.send("info name TestBot author Cankyre version 1.0")
    bot2.send("info name TestBot2 author Cankyre version 1.0")

    while True:
        i += 1

        if i == 10:
            return

        response = bot.receive()
        handle_command(response, bot)
        response2 = bot2.receive()
        handle_command(response2, bot2)
