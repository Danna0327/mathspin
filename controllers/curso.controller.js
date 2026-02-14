const Curso = require("../models/Curso");

// Crear curso
exports.crearCurso = async (req, res) => {
  try {
    const { nombreCurso, codigoCurso } = req.body;

    // Validación básica
    if (!nombreCurso || !codigoCurso) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios",
      });
    }

    // Verificar si el código ya existe
    const cursoExistente = await Curso.findOne({ codigoCurso });

    if (cursoExistente) {
      return res.status(400).json({
        message: "El código ya existe, intenta nuevamente",
      });
    }

    // Crear nuevo curso
    const nuevoCurso = new Curso({
      nombreCurso,
      codigoCurso,
      profesor: req.user.id, // viene del middleware de autenticación
    });

    await nuevoCurso.save();

    res.status(201).json({
      message: "Curso creado correctamente",
      curso: nuevoCurso,
    });

  } catch (error) {
    console.error("Error al crear curso:", error);
    res.status(500).json({
      message: "Error del servidor",
    });
  }
};
