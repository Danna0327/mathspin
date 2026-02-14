const Curso = require("../models/curso.model");
const Usuario = require("../models/user.model");
const Session = require("../models/session.model");

// ================================
// 🔥 CREAR CURSO
// ================================
exports.crearCurso = async (req, res) => {
  try {
    const { paralelo, descripcion, codigo } = req.body;

    // 🔥 Tomar ID correctamente desde el token
    const docenteId = req.user._id || req.user.id;

    if (!docenteId) {
      return res.status(401).json({ mensaje: "Usuario no autenticado correctamente" });
    }

    if (!paralelo || !descripcion) {
      return res.status(400).json({ mensaje: "Paralelo y descripción son obligatorios" });
    }

    // Verificar código duplicado
    if (codigo) {
      const cursoExistente = await Curso.findOne({ codigo });
      if (cursoExistente) {
        return res.status(400).json({ mensaje: "El código de curso ya existe" });
      }
    }

    const nuevoCurso = new Curso({
      paralelo,
      descripcion,
      codigo: codigo || undefined,
      docenteId,
    });

    await nuevoCurso.save();

    res.status(201).json({
      mensaje: "Curso creado exitosamente",
      curso: nuevoCurso,
    });

  } catch (error) {
    console.error("🔥 ERROR REAL crearCurso:", error);
    res.status(500).json({
      mensaje: "Error al crear curso",
      error: error.message,
    });
  }
};

// ================================
// 🔥 OBTENER CURSOS DOCENTE
// ================================
exports.obtenerCursosDocente = async (req, res) => {
  try {
    const docenteId = req.user._id || req.user.id;

    const cursos = await Curso.find({ docenteId, activo: true })
      .populate("docenteId", "nombre apellido")
      .sort({ createdAt: -1 });

    res.json({ cursos });

  } catch (error) {
    console.error("Error al obtener cursos:", error);
    res.status(500).json({ mensaje: "Error al obtener cursos" });
  }
};

// ================================
// 🔥 OBTENER ANALYTICS
// ================================
exports.obtenerAnalyticsCurso = async (req, res) => {
  try {
    const { cursoId } = req.params;

    const estudiantes = await Usuario.find({
      cursoId,
      activo: true,
    }).select("_id nombre apellido");

    const sesiones = await Session.find({
      usuarioId: { $in: estudiantes.map(e => e._id) }
    });

    res.json({
      totalEstudiantes: estudiantes.length,
      totalSesiones: sesiones.length
    });

  } catch (error) {
    console.error("Error analytics:", error);
    res.status(500).json({ mensaje: "Error al obtener analytics" });
  }
};

// ================================
// 🔥 OBTENER ESTUDIANTES
// ================================
exports.obtenerEstudiantesCurso = async (req, res) => {
  try {
    const { cursoId } = req.params;

    const estudiantes = await Usuario.find({
      cursoId,
      rol: "estudiante",
      activo: true,
    }).select("nombre apellido nombreUsuario ultimaConexion");

    res.json({ estudiantes });

  } catch (error) {
    console.error("Error al obtener estudiantes:", error);
    res.status(500).json({ mensaje: "Error al obtener estudiantes" });
  }
};

// ================================
// 🔥 ELIMINAR ESTUDIANTE
// ================================
exports.eliminarEstudianteCurso = async (req, res) => {
  try {
    const { estudianteId } = req.params;

    await Usuario.findByIdAndUpdate(estudianteId, {
      cursoId: null,
    });

    res.json({ mensaje: "Estudiante eliminado del curso" });

  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar estudiante" });
  }
};

// ================================
// 🔥 TRANSFERIR ESTUDIANTE
// ================================
exports.transferirEstudiante = async (req, res) => {
  try {
    const { estudianteId } = req.params;
    const { nuevoCursoId } = req.body;

    await Usuario.findByIdAndUpdate(estudianteId, {
      cursoId: nuevoCursoId,
    });

    res.json({ mensaje: "Estudiante transferido" });

  } catch (error) {
    res.status(500).json({ mensaje: "Error al transferir estudiante" });
  }
};

