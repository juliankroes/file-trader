import { Application, Router } from "https://deno.land/x/oak/mod.ts"

const app: Application = new Application()
const port: number = 6969
const router: Router = new Router()

const FILE_STORAGE_PATH = "./stored_file.json"

interface storedFile {
  rawData: ArrayBuffer,
  filename: string,
  type: string
}

router.get("/start_web_socket", async (ctx) => {
    const socket = await ctx.upgrade()

    socket.onopen = () => {
        console.log("client socket opened!")
    }

    socket.onclose = () => {
        console.log("client socket closed!")
    }

    socket.onmessage = async (message: MessageEvent) => {
        const receivedFile: storedFile = JSON.parse(message.data)

        // Respond with the saved file
        const storedFile = await loadFile()
        if (storedFile) {
            socket.send(JSON.stringify(storedFile))
        }
        
        // Save the file to disk
        await Deno.writeTextFile(FILE_STORAGE_PATH, JSON.stringify(receivedFile))
        console.log(`File saved: ${receivedFile.filename}`)

        
    }
})

async function loadFile(): Promise<storedFile | null> {
    try {
        const fileContent = await Deno.readTextFile(FILE_STORAGE_PATH)
        return JSON.parse(fileContent)
    } catch {
        return null
    }
}

app.use(router.routes())
app.use(router.allowedMethods())

await app.listen({ port })
console.log(`Server is running at http://localhost:${port}`)
