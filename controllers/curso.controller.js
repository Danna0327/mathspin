const Curso = require("../models/curso.model");
const Usuario = require("../models/user.model");

// ================================
// CREAR CURSO
// ================================
exports.crearCurso = async (req, res) => {
  try {
    const { nombreCurso, codigoCurso } = req.body;

    if (!nombreCurso || !codigoCurso) {
      return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }

    const cursoExistente = await Curso.findOne({
      $or: [{ codigoCurso }, { codigo: codigoCurso }]
    });

    if (cursoExistente) {
      return res.status(400).json({ mensaje: "El código ya existe, intenta nuevamente" });
    }

    const nuevoCurso = new Curso({
      nombreCurso,
      codigoCurso,
      codigo: codigoCurso,
      docenteId: req.userId,
      estudiantes: []
    });

    await nuevoCurso.save();
    console.log('✅ Curso creado:', nuevoCurso._id);

    res.status(201).json({ mensaje: "Curso creado correctamente", curso: nuevoCurso });

  } catch (error) {
    console.error("❌ Error al crear curso:", error);
    res.status(500).json({ mensaje: "Error del servidor", error: error.message });
  }
};

// ================================
// OBTENER CURSOS DEL DOCENTE
// ================================
exports.obtenerCursosDocente = async (req, res) => {
  try {
    console.log('📚 Obteniendo cursos del docente:', req.userId);

    const cursos = await Curso.find({ docenteId: req.userId })
      .sort({ createdAt: -1 })
      .lean();

    console.log('✅ Cursos encontrados:', cursos.length);
    res.json(cursos);

  } catch (error) {
    console.error('❌ Error obteniendo cursos:', error);
    res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
  }
};

// ================================
// OBTENER TODOS LOS ESTUDIANTES DEL DOCENTE
// Agrupados por curso
// ================================
exports.obtenerEstudiantesDocente = async (req, res) => {
  try {
    console.log('👥 Obteniendo estudiantes del docente:', req.userId);

    // Obtener todos los cursos del docente con sus estudiantes
    const cursos = await Curso.find({ docenteId: req.userId })
      .sort({ createdAt: -1 })
      .lean();

    if (cursos.length === 0) {
      return res.json({ cursos: [], totalEstudiantes: 0 });
    }

    // Recopilar todos los IDs de estudiantes
    const todosLosIds = cursos.flatMap(c => c.estudiantes || []);
    const idsUnicos = [...new Set(todosLosIds.map(id => id.toString()))];

    // Obtener datos de todos los estudiantes de una sola consulta
    const estudiantes = await Usuario.find(
      { _id: { $in: idsUnicos } },
      { contrasena: 0 }  // Excluir contraseña
    ).lean();

    // Crear mapa id → datos del estudiante
    const mapaEstudiantes = {};
    estudiantes.forEach(est => {
      mapaEstudiantes[est._id.toString()] = est;
    });

    // Armar respuesta agrupada por curso
    const cursosConEstudiantes = cursos.map(curso => {
      const codigo = curso.codigoCurso || curso.codigo || 'SIN-CODIGO';
      const estudiantesCurso = (curso.estudiantes || [])
        .map(id => mapaEstudiantes[id.toString()])
        .filter(Boolean); // Filtrar los que no se encontraron

      return {
        _id: curso._id,
        nombreCurso: curso.nombreCurso,
        codigo,
        totalEstudiantes: estudiantesCurso.length,
        estudiantes: estudiantesCurso.map(est => ({
          _id: est._id,
          nombre: est.nombre,
          apellido: est.apellido,
          nombreUsuario: est.nombreUsuario,
          paralelo: est.paralelo || '-',
          ultimaConexion: est.ultimaConexion,
          createdAt: est.createdAt
        }))
      };
    });

    const totalEstudiantes = idsUnicos.length;
    console.log(`✅ ${cursos.length} cursos, ${totalEstudiantes} estudiantes en total`);

    res.json({ cursos: cursosConEstudiantes, totalEstudiantes });

  } catch (error) {
    console.error('❌ Error obteniendo estudiantes:', error);
    res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
  }
};

// ================================
// ELIMINAR ESTUDIANTE DE UN CURSO
// ================================
exports.eliminarEstudianteCurso = async (req, res) => {
  try {
    const { cursoId, estudianteId } = req.params;

    const curso = await Curso.findOne({ _id: cursoId, docenteId: req.userId });
    if (!curso) return res.status(404).json({ mensaje: 'Curso no encontrado' });

    await Curso.findByIdAndUpdate(
      cursoId,
      { $pull: { estudiantes: estudianteId } }
    );

    console.log(`✅ Estudiante ${estudianteId} eliminado del curso ${cursoId}`);
    res.json({ mensaje: 'Estudiante eliminado del curso' });

  } catch (error) {
    console.error('❌ Error eliminando estudiante:', error);
    res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
  }
};
