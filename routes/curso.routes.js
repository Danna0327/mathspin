const express = require("express");
const router = express.Router();
const cursoController = require("../controllers/cursoController");
const auth = require("../middleware/authMiddleware");

// Crear curso
router.post("/crear", auth, cursoController.crearCurso);

// Obtener cursos del docente
router.get("/docente", auth, cursoController.obtenerCursosDocente);

module.exports = router;

