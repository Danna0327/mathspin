const express = require("express");
const router = express.Router();
const questionController = require("../controllers/question.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// ================================
// 🔐 TODAS REQUIEREN LOGIN
// ================================
router.use(authMiddleware);

// ================================
// 🔥 RUTAS DE PREGUNTAS
// ================================

// Crear pregunta
router.post("/", questionController.crearPregunta);

// Obtener preguntas del docente
router.get("/", questionController.obtenerPreguntasDocente);

// Obtener preguntas por categoría y dificultad (para el juego)
router.get("/category/:categoria", questionController.getByCategoryAndDifficulty);

// Actualizar pregunta
router.put("/:id", questionController.actualizarPregunta);

// Eliminar pregunta
router.delete("/:id", questionController.eliminarPregunta);

module.exports = router;
