import { Elysia, t } from "elysia";

const app = new Elysia()

app.ws("/bot", {
    body: t.String(),

    open(ws) {
        console.log("open")
    },
    message(ws, msg) {
        console.log(msg)
    },
    close(ws) {
        console.log("close")

    },
})

app.listen(Bun.env.PORT || 3000)