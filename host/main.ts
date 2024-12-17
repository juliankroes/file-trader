import { Application, Router } from "https://deno.land/x/oak/mod.ts"

const app: Application = new Application()
const port: number = 6969
const router: Router = new Router()

interface storedFile {
  rawData: ArrayBuffer,
  filename: string,
  type: string
}

let currentlyStoredFile: storedFile;


router.get("/start_web_socket", async (ctx) => {
    const socket = await ctx.upgrade()

    socket.onopen = () => {
        console.log("client socket opened!")
    }

    socket.onclose = () => {
        console.log("client socket closed!")
    }

    socket.onmessage = async (message: MessageEvent) => {
        if (currentlyStoredFile) {
            socket.send(JSON.stringify(currentlyStoredFile))
        }
        currentlyStoredFile = JSON.parse(message.data)
    }
})

app.use(router.routes())
app.use(router.allowedMethods())

await app.listen({ port })
console.log(`Server is running at http://localhost:${port}`)
