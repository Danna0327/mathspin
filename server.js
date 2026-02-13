require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

// =============================
// 🔹 CONEXIÓN A MONGODB
// =============================
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conexión a MongoDB exitosa");
  } catch (error) {
    console.error("❌ Error de conexión a MongoDB:", error);
    process.exit(1);
  }
};

connectDB();

// =============================
// 🔹 MIDDLEWARES
// =============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =============================
// 🔹 ARCHIVOS ESTÁTICOS
// =============================
app.use(express.static(path.join(__dirname, "public")));

// Ruta principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// =============================
// 🔹 PUERTO (IMPORTANTE PARA RAILWAY)
// =============================
const PORT = process.env.PORT;

if (!PORT) {
  console.error("❌ Railway no asignó un puerto");
  process.exit(1);
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

