const express = require("express");
const router = express.Router();
const cursoController = require("../controllers/curso.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.use(authMiddleware);

router.post("/crear", cursoController.crearCurso);
router.get("/docente", cursoController.obtenerCursosDocente);

module.exports = router;
