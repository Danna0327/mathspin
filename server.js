require("dotenv").config()
const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

// Ruta raíz obligatoria
app.get("/", (req, res) => {
  res.status(200).send("MathSpin funcionando en Railway 🚀")
})

// Puerto dinámico obligatorio
const PORT = process.env.PORT

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
})
