require("dotenv").config()
const express = require("express")
const cors = require("cors")
const path = require("path")
const http = require("http")

const connectDB = require("./config/db")

// =============================
// IMPORTAR RUTAS
// =============================
const userRoutes = require("./routes/user.routes")
const cursoRoutes = require("./routes/curso.routes")
const questionRoutes = require("./routes/question.routes")
const sessionRoutes = require("./routes/session.routes")
const gameRoutes = require("./routes/game.routes")

// =============================
// SOCKET.IO
// =============================
const { Server } = require("socket.io")

// =============================
// SERIAL (ARDUINO)
// =============================
const { SerialPort } = require("serialport")
const { ReadlineParser } = require("@serialport/parser-readline")

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

// =============================
// CONECTAR A MONGODB
// =============================
connectDB()

// =============================
// MIDDLEWARES
// =============================
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// =============================
// SERVIR FRONTEND (CARPETA PUBLIC)
// =============================
const staticDir = path.join(__dirname, "public")

app.use(express.static(staticDir))

app.get("/", (req, res) => {
  res.sendFile(path.join(staticDir, "index.html"))
})

// =============================
// RUTAS API
// =============================
app.use("/api/users", userRoutes)
app.use("/api/cursos", cursoRoutes)
app.use("/api/questions", questionRoutes)
app.use("/api/sessions", sessionRoutes)
app.use("/api/game", gameRoutes)

// Ruta de prueba
app.get("/api/test", (req, res) => {
  res.json({ mensaje: "API funcionando correctamente" })
})

// =============================
// SOCKET.IO CONEXIONES WEB
// =============================
io.on("connection", (socket) => {
  console.log("✅ Web conectada:", socket.id)

  socket.on("disconnect", () => {
    console.log("❌ Web desconectada:", socket.id)
  })
})

// =============================
// SERIAL ARDUINO (OPCIONAL)
// =============================
function initArduinoSerial() {
  const SERIAL_PORT = process.env.SERIAL_PORT
  const SERIAL_BAUD = parseInt(process.env.SERIAL_BAUD || "9600", 10)

  if (!SERIAL_PORT || SERIAL_PORT === "NONE") {
    console.log("⚠️ Serial deshabilitado")
    return
  }

  console.log(`🔌 Conectando Arduino en ${SERIAL_PORT} @ ${SERIAL_BAUD}`)

  try {
    const port = new SerialPort({ path: SERIAL_PORT, baudRate: SERIAL_BAUD })
    const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }))

    port.on("open", () => {
      console.log("✅ Arduino conectado:", SERIAL_PORT)
    })

    port.on("error", (err) => {
      console.error("❌ Error Serial:", err.message)
    })

    parser.on("data", (line) => {
      const msg = String(line).trim()
      if (!msg) return

      console.log("📟 Arduino:", msg)

      if (msg.startsWith("NAV:")) {
        const dir = msg.split(":")[1]?.toLowerCase()
        io.emit("arduino:event", { type: "nav", value: dir })
        return
      }

      if (msg.startsWith("PRESET:")) {
        const opt = msg.split(":")[1]?.toLowerCase()
        io.emit("arduino:event", { type: "preset", value: opt })
        return
      }

      if (msg.startsWith("CLICK:")) {
        io.emit("arduino:event", { type: "click", value: "sw" })
        return
      }

      io.emit("arduino:event", { type: "raw", value: msg })
    })
  } catch (e) {
    console.error("❌ No se pudo iniciar Serial:", e.message)
  }
}

initArduinoSerial()

// =============================
// MANEJO DE ERRORES
// =============================
app.use((err, req, res, next) => {
  console.error("❌ Error interno:", err.stack)
  res.status(500).json({ mensaje: "Error interno del servidor" })
})

// =============================
// INICIAR SERVIDOR (RAILWAY)
// =============================
const PORT = process.env.PORT

if (!PORT) {
  console.error("❌ PORT no definido")
  process.exit(1)
}

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
})

