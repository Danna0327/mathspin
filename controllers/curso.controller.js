const Curso = require("../models/curso.model");
const User = require("../models/user.model");
const Session = require("../models/session.model");

// Crear curso
exports.crearCurso = async (req, res) => {
  try {
    const { nombreCurso, codigoCurso } = req.body;

    if (!nombreCurso || !codigoCurso) {
      return res.status(400).json({
        mensaje: "Todos los campos son obligatorios",
      });
    }

    // Verificar si el código ya existe
    const cursoExistente = await Curso.findOne({ codigoCurso });

    if (cursoExistente) {
      return res.status(400).json({
        mensaje: "El código ya existe, intenta nuevamente",
      });
    }

    // Crear nuevo curso
    const nuevoCurso = new Curso({
      nombreCurso,
      codigoCurso,  // ✅ Guardar en codigoCurso
      docenteId: req.userId,
      estudiantes: []
    });

    await nuevoCurso.save();
    console.log('✅ Curso creado:', nuevoCurso._id);

    res.status(201).json({
      mensaje: "Curso creado correctamente",
      curso: nuevoCurso,
    });

  } catch (error) {
    console.error("❌ Error al crear curso:", error);
    res.status(500).json({
      mensaje: "Error del servidor",
      error: error.message
    });
  }
};

// Obtener cursos del docente
exports.obtenerCursosDocente = async (req, res) => {
  try {
    console.log('📚 Obteniendo cursos del docente:', req.userId);
    
    const cursos = await Curso.find({ docenteId: req.userId })
      .sort({ createdAt: -1 })
      .lean();

    console.log('✅ Cursos encontrados:', cursos.length);
    
    res.json(cursos);
  } catch (error) {
    console.error('❌ Error obteniendo cursos del docente:', error);
    res.status(500).json({ 
      mensaje: 'Error del servidor',
      error: error.message 
    });
  }
};

// Obtener analytics de un curso
exports.obtenerAnalyticsCurso = async (req, res) => {
  try {
    const { cursoId } = req.params;
    const { periodo } = req.query;

    console.log('📊 Obteniendo analytics del curso:', cursoId);

    const curso = await Curso.findOne({ 
      _id: cursoId, 
      docenteId: req.userId 
    });

    if (!curso) {
      return res.status(404).json({ mensaje: 'Curso no encontrado' });
    }

    const ahora = new Date();
    let fechaInicio;

    switch (periodo) {
      case 'semana':
        fechaInicio = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'mes':
        fechaInicio = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        fechaInicio = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const sesiones = await Session.find({
      usuarioId: { $in: curso.estudiantes },
      fechaInicio: { $gte: fechaInicio }
    });

    const kpis = {
      totalEstudiantes: curso.estudiantes.length,
      totalSesiones: sesiones.length,
      promedioGeneral: sesiones.length > 0 
        ? sesiones.reduce((sum, s) => sum + (s.porcentaje || 0), 0) / sesiones.length 
        : 0,
      tiempoPromedio: sesiones.length > 0 
        ? sesiones.reduce((sum, s) => sum + (s.duracion || 0), 0) / sesiones.length 
        : 0
    };

    res.json({
      kpis,
      estadisticasPorCategoria: {},
      topEstudiantes: [],
      sesionesRecientes: sesiones.slice(0, 10)
    });

  } catch (error) {
    console.error('❌ Error obteniendo analytics:', error);
    res.status(500).json({ 
      mensaje: 'Error del servidor',
      error: error.message 
    });
  }
};

// Obtener estudiantes de un curso
exports.obtenerEstudiantesCurso = async (req, res) => {
  try {
    const { cursoId } = req.params;

    const curso = await Curso.findOne({ 
      _id: cursoId, 
      docenteId: req.userId 
    });

    if (!curso) {
      return res.status(404).json({ mensaje: 'Curso no encontrado' });
    }

    res.json({ estudiantes: curso.estudiantes || [] });

  } catch (error) {
    console.error('❌ Error obteniendo estudiantes:', error);
    res.status(500).json({ 
      mensaje: 'Error del servidor',
      error: error.message 
    });
  }
};

// Eliminar estudiante de un curso
exports.eliminarEstudianteCurso = async (req, res) => {
  try {
    const { cursoId, estudianteId } = req.params;

    const curso = await Curso.findOne({ 
      _id: cursoId, 
      docenteId: req.userId 
    });

    if (!curso) {
      return res.status(404).json({ mensaje: 'Curso no encontrado' });
    }

    curso.estudiantes = curso.estudiantes.filter(
      estId => estId.toString() !== estudianteId
    );

    await curso.save();

    res.json({ 
      mensaje: 'Estudiante eliminado del curso',
      curso 
    });

  } catch (error) {
    console.error('❌ Error eliminando estudiante:', error);
    res.status(500).json({ 
      mensaje: 'Error del servidor',
      error: error.message 
    });
  }
};

// Transferir estudiante a otro curso
exports.transferirEstudiante = async (req, res) => {
  try {
    const { estudianteId } = req.params;
    const { cursoOrigenId, cursoDestinoId } = req.body;

    const cursoOrigen = await Curso.findOne({ 
      _id: cursoOrigenId, 
      docenteId: req.userId 
    });

    const cursoDestino = await Curso.findOne({ 
      _id: cursoDestinoId, 
      docenteId: req.userId 
    });

    if (!cursoOrigen || !cursoDestino) {
      return res.status(404).json({ mensaje: 'Uno o ambos cursos no encontrados' });
    }

    cursoOrigen.estudiantes = cursoOrigen.estudiantes.filter(
      estId => estId.toString() !== estudianteId
    );

    if (!cursoDestino.estudiantes.includes(estudianteId)) {
      cursoDestino.estudiantes.push(estudianteId);
    }

    await cursoOrigen.save();
    await cursoDestino.save();

    res.json({ 
      mensaje: 'Estudiante transferido exitosamente',
      cursoOrigen,
      cursoDestino
    });

  } catch (error) {
    console.error('❌ Error transfiriendo estudiante:', error);
    res.status(500).json({ 
      mensaje: 'Error del servidor',
      error: error.message 
    });
  }
};
