const Curso = require("../models/curso.model");

// ================================
// 🔹 CREAR CURSO
// ================================
exports.crearCurso = async (req, res) => {
  try {
    console.log("📥 Body recibido:", req.body);

    const { nombre, paralelo, descripcion } = req.body;

    // Validación básica
    if (!nombre || !paralelo) {
      return res.status(400).json({
        mensaje: "Nombre y paralelo son obligatorios",
      });
    }

    // Crear curso
    const nuevoCurso = new Curso({
      nombre,
      paralelo,
      descripcion,
      docenteId: req.user.id, // viene del middleware
    });

    await nuevoCurso.save();

    res.status(201).json({
      mensaje: "Curso creado exitosamente",
      curso: nuevoCurso,
    });

  } catch (error) {
    console.error("❌ Error al crear curso:", error);
    res.status(500).json({
      mensaje: "Error interno del servidor",
      error: error.message,
    });
  }
};

// ================================
// 🔹 OBTENER CURSOS DEL DOCENTE
// ================================
exports.obtenerCursosDocente = async (req, res) => {
  try {
    const cursos = await Curso.find({
      docenteId: req.user.id,
      activo: true,
    }).sort({ createdAt: -1 });

    res.json({ cursos });

  } catch (error) {
    console.error("❌ Error al obtener cursos:", error);
    res.status(500).json({
      mensaje: "Error al obtener cursos",
      error: error.message,
    });
  }
};
