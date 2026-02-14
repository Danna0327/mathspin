require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

// Rutas
const userRoutes = require("./routes/user.routes");
const cursoRoutes = require("./routes/curso.routes");
const questionRoutes = require("./routes/question.routes");
const sessionRoutes = require("./routes/session.routes");
const gameRoutes = require("./routes/game.routes");

const app = express();
const server = http.createServer(app);

// ✅ IMPORTANTE PARA RAILWAY
app.set("trust proxy", 1);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================================
// 🔥 CONECTAR MONGODB
// ================================
connectDB();

// ================================
// 🔥 RUTAS API
// ================================
app.use("/api/users", userRoutes);
app.use("/api/cursos", cursoRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/game", gameRoutes);

app.get("/api/test", (req, res) => {
  res.json({ mensaje: "API funcionando correctamente 🚀" });
});

// ================================
// 🔥 SOCKET.IO
// ================================
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("✅ Socket conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Socket desconectado");
  });
});

// ================================
// 🔥 SERVIR FRONTEND
// ================================
const staticDir = path.join(__dirname, "public");
app.use(express.static(staticDir));

// IMPORTANTE: ESTA RUTA VA AL FINAL
app.get("*", (req, res) => {
  res.sendFile(path.join(staticDir, "index.html"));
});

// ================================
// 🔥 INICIAR SERVIDOR
// ================================
const PORT = process.env.PORT || 8080;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
