const Curso = require("../models/Curso");

// 🔹 Crear curso
exports.crearCurso = async (req, res) => {
  try {
    const { nombreCurso, codigoCurso } = req.body;

    console.log("📥 Body recibido:", req.body);

    if (!nombreCurso || !codigoCurso) {
      return res.status(400).json({
        message: "Nombre y código del curso son obligatorios",
      });
    }

    const cursoExistente = await Curso.findOne({ codigoCurso });

    if (cursoExistente) {
      return res.status(400).json({
        message: "El código del curso ya existe",
      });
    }

    const nuevoCurso = new Curso({
      nombreCurso,
      codigoCurso,
      docenteId: req.user.id, // viene del middleware auth
    });

    await nuevoCurso.save();

    res.status(201).json(nuevoCurso);
  } catch (error) {
    console.error("❌ Error al crear curso:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// 🔹 Obtener cursos del docente
exports.obtenerCursosDocente = async (req, res) => {
  try {
    const cursos = await Curso.find({
      docenteId: req.user.id,
    });

    res.json(cursos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener cursos" });
  }
};
