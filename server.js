require("dotenv").config()
const express = require("express")
const cors = require("cors")
const path = require("path")

const app = express()

app.use(cors())
app.use(express.json())

// ============================
// 🔥 PRUEBA SIMPLE ROOT
// ============================
app.get("/", (req, res) => {
  res.send("MATHSPIN BACKEND FUNCIONANDO CORRECTAMENTE 🚀")
})

// ============================
// 🔥 SERVIR ARCHIVOS PUBLIC
// ============================
const staticDir = path.join(__dirname, "public")
app.use(express.static(staticDir))

// ============================
// 🔥 PUERTO RAILWAY
// ============================
const PORT = process.env.PORT || 8080

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
})
