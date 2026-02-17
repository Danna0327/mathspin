const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Rutas públicas
router.post("/register", userController.registrarUsuario);
router.post("/login", userController.iniciarSesion);

// Rutas protegidas
router.post("/unirse-curso", authMiddleware, userController.unirseACurso);
router.get("/perfil", authMiddleware, userController.obtenerPerfil);

module.exports = router;
