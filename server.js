require("dotenv").config()
const express = require("express")
const cors = require("cors")
const path = require("path")
const http = require("http")

const connectDB = require("./config/db")

// Importar rutas
const userRoutes = require("./routes/user.routes")
const cursoRoutes = require("./routes/curso.routes")
const questionRoutes = require("./routes/question.routes")
const sessionRoutes = require("./routes/session.routes")
const gameRoutes = require("./routes/game.routes")

// ✅ Socket.IO
const { Server } = require("socket.io")

// ✅ Serial Arduino
const { SerialPort } = require("serialport")
const { ReadlineParser } = require("@serialport/parser-readline")

const app = express()
const server = http.createServer(app)

// ✅ Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

// Conectar a la base de datos
connectDB()

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Carpeta pública
const staticDir = path.join(__dirname, "public")
app.use(express.static(staticDir))

// ============================
// RUTAS API
// ============================
app.use("/api/users", userRoutes)
app.use("/api/cursos", cursoRoutes)
app.use("/api/questions", questionRoutes)
app.use("/api/sessions", sessionRoutes)
app.use("/api/game", gameRoutes)

// Ruta de prueba
app.get("/api/test", (req, res) => {
  res.json({ mensaje: "API funcionando correctamente" })
})

// ============================
// RUTA PRINCIPAL FRONTEND
// ============================
app.get("/", (req, res) => {
  res.sendFile(path.join(staticDir, "index.html"))
})

// ============================
// MANEJO DE ERRORES
// ============================
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ mensaje: "Error interno del servidor" })
})

// ============================
// SOCKET.IO
// ============================
io.on("connection", (socket) => {
  console.log("✅ Web conectada por Socket.IO:", socket.id)

  socket.on("disconnect", () => {
    console.log("❌ Web desconectada:", socket.id)
  })
})

// ============================
// SERIAL ARDUINO
// ============================
function initArduinoSerial() {
  const SERIAL_PORT = process.env.SERIAL_PORT || "COM3"
  const SERIAL_BAUD = parseInt(process.env.SERIAL_BAUD || "9600", 10)

  console.log(`🔌 Intentando conectar Arduino en ${SERIAL_PORT} @ ${SERIAL_BAUD}...`)

  try {
    const port = new SerialPort({ path: SERIAL_PORT, baudRate: SERIAL_BAUD })
    const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }))

    port.on("open", () => {
      console.log("✅ Arduino conectado por Serial:", SERIAL_PORT)
    })

    port.on("error", (err) => {
      console.error("❌ Error SerialPort:", err.message)
    })

    parser.on("data", (line) => {
      const msg = String(line).trim()
      if (!msg) return

      console.log("📟 Arduino:", msg)

      if (msg.startsWith("NAV:")) {
        const dir = msg.split(":")[1]?.toLowerCase()
        if (["up", "down", "left", "right"].includes(dir)) {
          io.emit("arduino:event", { type: "nav", value: dir })
        }
        return
      }

      if (msg.startsWith("PRESET:")) {
        const opt = msg.split(":")[1]?.toLowerCase()
        if (["a", "b", "c", "d"].includes(opt)) {
          io.emit("arduino:event", { type: "preset", value: opt })
        }
        return
      }

      if (msg.startsWith("CLICK:")) {
        io.emit("arduino:event", { type: "click", value: "sw" })
        return
      }

      io.emit("arduino:event", { type: "raw", value: msg })
    })
  } catch (e) {
    console.error("❌ No se pudo inicializar Serial:", e.message)
  }
}

// Inicializar Serial solo si está configurado
if (process.env.SERIAL_PORT && process.env.SERIAL_PORT !== "NONE") {
  initArduinoSerial()
} else {
  console.log("⚠️ Serial deshabilitado")
}

// ============================
// INICIAR SERVIDOR
// ============================
const PORT = process.env.PORT || 5000
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`)
})
