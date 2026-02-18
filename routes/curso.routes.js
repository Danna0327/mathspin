const express = require("express");
const router = express.Router();
const cursoController = require("../controllers/curso.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.use(authMiddleware);

router.post("/crear",                               cursoController.crearCurso);
router.put("/:cursoId",                             cursoController.editarCurso);
router.get("/docente",                              cursoController.obtenerCursosDocente);
router.get("/estudiantes",                          cursoController.obtenerEstudiantesDocente);
router.get("/:cursoId/analytics",                   cursoController.obtenerAnalyticsCurso);
router.delete("/:cursoId/estudiante/:estudianteId", cursoController.eliminarEstudianteCurso);

module.exports = router;
