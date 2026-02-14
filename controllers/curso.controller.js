const Curso = require("../models/curso.model");

// ======================================
// 🔥 CREAR CURSO
// POST /api/cursos/crear
// ======================================
exports.crearCurso = async (req, res) => {
  try {
    const { nombre, nivel, paralelo } = req.body;

    const docenteId = req.user?._id || req.user?.id;

    if (!docenteId) {
      return res.status(401).json({
        mensaje: "Usuario no autenticado",
      });
    }

    if (!nombre || !nivel || !paralelo) {
      return res.status(400).json({
        mensaje: "Nombre, nivel y paralelo son obligatorios",
      });
    }

    const nuevoCurso = new Curso({
      nombre,
      nivel,
      paralelo,
      docenteId,
      estudiantes: [],
    });

    await nuevoCurso.save();

    res.status(201).json({
      mensaje: "Curso creado exitosamente",
      curso: nuevoCurso,
    });

  } catch (error) {
    console.error("🔥 ERROR crearCurso:", error);
    res.status(500).json({
      mensaje: "Error al crear curso",
      error: error.message,
    });
  }
};

// ======================================
// 🔥 OBTENER CURSOS DEL DOCENTE
// GET /api/cursos/docente
// ======================================
exports.obtenerCursosDocente = async (req, res) => {
  try {
    const docenteId = req.user?._id || req.user?.id;

    if (!docenteId) {
      return res.status(401).json({
        mensaje: "Usuario no autenticado",
      });
    }

    const cursos = await Curso.find({ docenteId }).sort({ createdAt: -1 });

    res.json({ cursos });

  } catch (error) {
    console.error("🔥 ERROR obtenerCursosDocente:", error);
    res.status(500).json({
      mensaje: "Error obteniendo cursos",
      error: error.message,
    });
  }
};

// ======================================
// 🔥 OBTENER ESTUDIANTES DE UN CURSO
// GET /api/cursos/:cursoId/estudiantes
// ======================================
exports.obtenerEstudiantesCurso = async (req, res) => {
  try {
    const { cursoId } = req.params;

    const curso = await Curso.findById(cursoId).populate("estudiantes");

    if (!curso) {
      return res.status(404).json({
        mensaje: "Curso no encontrado",
      });
    }

    res.json({
      estudiantes: curso.estudiantes,
    });

  } catch (error) {
    console.error("🔥 ERROR obtenerEstudiantesCurso:", error);
    res.status(500).json({
      mensaje: "Error obteniendo estudiantes",
      error: error.message,
    });
  }
};

// ======================================
// 🔥 ELIMINAR ESTUDIANTE DE UN CURSO
// DELETE /api/cursos/estudiante/:estudianteId
// ======================================
exports.eliminarEstudianteCurso = async (req, res) => {
  try {
    const { estudianteId } = req.params;
    const { cursoId } = req.body;

    const curso = await Curso.findById(cursoId);

    if (!curso) {
      return res.status(404).json({
        mensaje: "Curso no encontrado",
      });
    }

    curso.estudiantes = curso.estudiantes.filter(
      (id) => id.toString() !== estudianteId
    );

    await curso.save();

    res.json({
      mensaje: "Estudiante eliminado correctamente",
    });

  } catch (error) {
    console.error("🔥 ERROR eliminarEstudianteCurso:", error);
    res.status(500).json({
      mensaje: "Error eliminando estudiante",
      error: error.message,
    });
  }
};

// ======================================
// 🔥 TRANSFERIR ESTUDIANTE A OTRO CURSO
// PUT /api/cursos/estudiante/:estudianteId/transferir
// ======================================
exports.transferirEstudiante = async (req, res) => {
  try {
    const { estudianteId } = req.params;
    const { cursoOrigenId, cursoDestinoId } = req.body;

    const cursoOrigen = await Curso.findById(cursoOrigenId);
    const cursoDestino = await Curso.findById(cursoDestinoId);

    if (!cursoOrigen || !cursoDestino) {
      return res.status(404).json({
        mensaje: "Curso origen o destino no encontrado",
      });
    }

    // Quitar del curso origen
    cursoOrigen.estudiantes = cursoOrigen.estudiantes.filter(
      (id) => id.toString() !== estudianteId
    );

    // Agregar al curso destino
    if (!cursoDestino.estudiantes.includes(estudianteId)) {
      cursoDestino.estudiantes.push(estudianteId);
    }

    await cursoOrigen.save();
    await cursoDestino.save();

    res.json({
      mensaje: "Estudiante transferido correctamente",
    });

  } catch (error) {
    console.error("🔥 ERROR transferirEstudiante:", error);
    res.status(500).json({
      mensaje: "Error transfiriendo estudiante",
      error: error.message,
    });
  }
};

// ======================================
// 🔥 ANALYTICS DEL CURSO
// GET /api/cursos/:cursoId/analytics
// ======================================
exports.obtenerAnalyticsCurso = async (req, res) => {
  try {
    const { cursoId } = req.params;

    const curso = await Curso.findById(cursoId);

    if (!curso) {
      return res.status(404).json({
        mensaje: "Curso no encontrado",
      });
    }

    res.json({
      totalEstudiantes: curso.estudiantes.length,
      curso,
    });

  } catch (error) {
    console.error("🔥 ERROR obtenerAnalyticsCurso:", error);
    res.status(500).json({
      mensaje: "Error obteniendo analytics",
      error: error.message,
    });
  }
};
