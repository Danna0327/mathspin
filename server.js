require("dotenv").config()
const express = require("express")
const cors = require("cors")
const path = require("path")
const http = require("http")
const mongoose = require("mongoose")

const app = express()
const server = http.createServer(app)

// =====================
// 🔌 CONEXIÓN MONGODB
// =====================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conexión a MongoDB exitosa"))
  .catch((err) => console.error("❌ Error MongoDB:", err))

// =====================
// 🛠 MIDDLEWARES
// =====================
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// =====================
// 📂 SERVIR FRONTEND
// =====================
const staticDir = path.join(__dirname, "public")
app.use(express.static(staticDir))

// 🔥 RUTA PRINCIPAL (CLAVE PARA RAILWAY)
app.get("/", (req, res) => {
  res.sendFile(path.join(staticDir, "index.html"))
})

// Ruta test
app.get("/api/test", (req, res) => {
  res.json({ mensaje: "API funcionando correctamente" })
})

// =====================
// 🚀 INICIAR SERVIDOR
// =====================
const PORT = process.env.PORT || 8080

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
})
