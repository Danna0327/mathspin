const Curso = require("../models/curso.model");
const Usuario = require("../models/user.model");
const Session = require("../models/session.model");

// ======================================
// 🔥 CREAR CURSO
// ======================================
exports.crearCurso = async (req, res) => {
  try {
    console.log("📥 Body recibido:", req.body);

    const docenteId = req.user?._id;

    if (!docenteId) {
      return res.status(401).json({
        mensaje: "Usuario no autenticado",
      });
    }

    const { nombreCurso, codigoCurso } = req.body;

    if (!nombreCurso || nombreCurso.trim() === "") {
      return res.status(400).json({
        mensaje: "El nombre del curso es obligatorio",
      });
    }

    // Generar paralelo automático (puedes cambiar esto luego)
    const paralelo = "A";

    const nuevoCurso = new Curso({
      nombre: nombreCurso.trim(),
      paralelo,
      codigo: codigoCurso || undefined,
      docenteId,
    });

    await nuevoCurso.save();

    res.status(201).json({
      mensaje: "Curso creado correctamente",
      curso: nuevoCurso,
    });

  } catch (error) {
    console.error("🔥 ERROR crearCurso:", error);
    res.status(500).json({
      mensaje: "Error interno al crear curso",
      error: error.message,
    });
  }
};

// ======================================
// 🔥 OBTENER CURSOS DEL DOCENTE
// ======================================
exports.obtenerCursosDocente = async (req, res) => {
  try {
    const docenteId = req.user?._id || req.user?.id;

    const cursos = await Curso.find({
      docenteId,
      activo: true,
    }).sort({ createdAt: -1 });

    res.json({ cursos });

  } catch (error) {
    console.error("🔥 ERROR obtenerCursosDocente:", error);
    res.status(500).json({
      mensaje: "Error al obtener cursos",
      error: error.message,
    });
  }
};

// ======================================
// 🔥 OBTENER ESTUDIANTES DE UN CURSO
// ======================================
exports.obtenerEstudiantesCurso = async (req, res) => {
  try {
    const { cursoId } = req.params;

    const estudiantes = await Usuario.find({
      cursoId,
      rol: "estudiante",
      activo: true,
    }).select("nombre apellido nombreUsuario ultimaConexion createdAt");

    res.json({ estudiantes });

  } catch (error) {
    console.error("🔥 ERROR obtenerEstudiantesCurso:", error);
    res.status(500).json({
      mensaje: "Error obteniendo estudiantes",
      error: error.message,
    });
  }
};

// ======================================
// 🔥 ELIMINAR ESTUDIANTE DEL CURSO
// ======================================
exports.eliminarEstudianteCurso = async (req, res) => {
  try {
    const { estudianteId } = req.params;

    await Usuario.findByIdAndUpdate(estudianteId, {
      cursoId: null,
    });

    res.json({
      mensaje: "Estudiante eliminado del curso",
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
// 🔥 TRANSFERIR ESTUDIANTE
// ======================================
exports.transferirEstudiante = async (req, res) => {
  try {
    const { estudianteId } = req.params;
    const { nuevoCursoId } = req.body;

    await Usuario.findByIdAndUpdate(estudianteId, {
      cursoId: nuevoCursoId,
    });

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

    const estudiantes = await Usuario.find({
      cursoId,
      activo: true,
    });

    const sesiones = await Session.find({
      usuarioId: { $in: estudiantes.map(e => e._id) },
    });

    const promedioGeneral =
      sesiones.length > 0
        ? Math.round(
            sesiones.reduce((acc, s) => acc + s.porcentaje, 0) /
              sesiones.length
          )
        : 0;

    // Actualizar estadísticas en el curso
    curso.totalEstudiantes = estudiantes.length;
    curso.totalSesiones = sesiones.length;
    await curso.save();

    res.json({
      totalEstudiantes: estudiantes.length,
      totalSesiones: sesiones.length,
      promedioGeneral,
    });

  } catch (error) {
    console.error("🔥 ERROR obtenerAnalyticsCurso:", error);
    res.status(500).json({
      mensaje: "Error obteniendo analytics",
      error: error.message,
    });
  }
};
