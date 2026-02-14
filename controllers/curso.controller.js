const Curso = require("../models/curso.model");
const User = require("../models/user.model");
const Session = require("../models/session.model");

// Crear curso
exports.crearCurso = async (req, res) => {
  try {
    const { nombreCurso, codigoCurso } = req.body;

    // Validación básica
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
      codigoCurso,
      docenteId: req.userId, // viene del middleware de autenticación
      estudiantes: []
    });

    await nuevoCurso.save();

    res.status(201).json({
      mensaje: "Curso creado correctamente",
      curso: nuevoCurso,
    });

  } catch (error) {
    console.error("Error al crear curso:", error);
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
      .populate('estudiantes', 'nombre apellido nombreUsuario')
      .sort({ createdAt: -1 });

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
    const { periodo } = req.query; // semana, mes, trimestre, año

    console.log('📊 Obteniendo analytics del curso:', cursoId, 'periodo:', periodo);

    // Verificar que el curso pertenece al docente
    const curso = await Curso.findOne({ 
      _id: cursoId, 
      docenteId: req.userId 
    }).populate('estudiantes');

    if (!curso) {
      return res.status(404).json({ 
        mensaje: 'Curso no encontrado' 
      });
    }

    // Calcular rango de fechas según el periodo
    const ahora = new Date();
    let fechaInicio;

    switch (periodo) {
      case 'semana':
        fechaInicio = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'mes':
        fechaInicio = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'trimestre':
        fechaInicio = new Date(ahora.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'año':
        fechaInicio = new Date(ahora.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        fechaInicio = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Obtener sesiones del periodo
    const sesiones = await Session.find({
      usuarioId: { $in: curso.estudiantes.map(e => e._id) },
      fechaInicio: { $gte: fechaInicio }
    }).populate('usuarioId', 'nombre apellido');

    // Calcular KPIs
    const kpis = {
      totalEstudiantes: curso.estudiantes.length,
      totalSesiones: sesiones.length,
      promedioGeneral: sesiones.length > 0 
        ? sesiones.reduce((sum, s) => sum + s.porcentaje, 0) / sesiones.length 
        : 0,
      tiempoPromedio: sesiones.length > 0 
        ? sesiones.reduce((sum, s) => sum + (s.duracion || 0), 0) / sesiones.length 
        : 0
    };

    // Estadísticas por categoría
    const estadisticasPorCategoria = {};
    const categorias = ['algebra', 'geometria', 'trigonometria', 'estadisticas', 'numeros', 'funciones'];
    
    categorias.forEach(cat => {
      const sesionesCat = sesiones.filter(s => s.categoria === cat);
      estadisticasPorCategoria[cat] = {
        totalSesiones: sesionesCat.length,
        promedioScore: sesionesCat.length > 0
          ? sesionesCat.reduce((sum, s) => sum + s.porcentaje, 0) / sesionesCat.length
          : 0
      };
    });

    // Top estudiantes
    const estudiantesStats = {};
    sesiones.forEach(sesion => {
      const userId = sesion.usuarioId._id.toString();
      if (!estudiantesStats[userId]) {
        estudiantesStats[userId] = {
          nombre: `${sesion.usuarioId.nombre} ${sesion.usuarioId.apellido}`,
          totalSesiones: 0,
          puntosTotales: 0
        };
      }
      estudiantesStats[userId].totalSesiones++;
      estudiantesStats[userId].puntosTotales += sesion.puntaje || 0;
    });

    const topEstudiantes = Object.values(estudiantesStats)
      .map(est => ({
        ...est,
        promedio: est.totalSesiones > 0 ? (est.puntosTotales / est.totalSesiones) * 20 : 0
      }))
      .sort((a, b) => b.promedio - a.promedio)
      .slice(0, 5);

    // Sesiones recientes
    const sesionesRecientes = sesiones
      .slice(0, 10)
      .map(s => ({
        estudiante: `${s.usuarioId.nombre} ${s.usuarioId.apellido}`,
        categoria: s.categoria,
        dificultad: s.dificultad,
        puntuacion: s.porcentaje,
        fecha: s.fechaInicio
      }));

    res.json({
      kpis,
      estadisticasPorCategoria,
      topEstudiantes,
      sesionesRecientes
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

    console.log('👥 Obteniendo estudiantes del curso:', cursoId);

    // Verificar que el curso pertenece al docente
    const curso = await Curso.findOne({ 
      _id: cursoId, 
      docenteId: req.userId 
    }).populate('estudiantes', 'nombre apellido nombreUsuario');

    if (!curso) {
      return res.status(404).json({ 
        mensaje: 'Curso no encontrado' 
      });
    }

    res.json(curso.estudiantes);

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

    console.log('🗑️ Eliminando estudiante', estudianteId, 'del curso', cursoId);

    // Verificar que el curso pertenece al docente
    const curso = await Curso.findOne({ 
      _id: cursoId, 
      docenteId: req.userId 
    });

    if (!curso) {
      return res.status(404).json({ 
        mensaje: 'Curso no encontrado' 
      });
    }

    // Eliminar estudiante del array
    curso.estudiantes = curso.estudiantes.filter(
      estId => estId.toString() !== estudianteId
    );

    await curso.save();

    console.log('✅ Estudiante eliminado del curso');

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

    console.log('🔄 Transfiriendo estudiante', estudianteId, 'de', cursoOrigenId, 'a', cursoDestinoId);

    // Verificar que ambos cursos pertenecen al docente
    const cursoOrigen = await Curso.findOne({ 
      _id: cursoOrigenId, 
      docenteId: req.userId 
    });

    const cursoDestino = await Curso.findOne({ 
      _id: cursoDestinoId, 
      docenteId: req.userId 
    });

    if (!cursoOrigen || !cursoDestino) {
      return res.status(404).json({ 
        mensaje: 'Uno o ambos cursos no encontrados' 
      });
    }

    // Eliminar del curso origen
    cursoOrigen.estudiantes = cursoOrigen.estudiantes.filter(
      estId => estId.toString() !== estudianteId
    );

    // Agregar al curso destino si no está ya
    if (!cursoDestino.estudiantes.includes(estudianteId)) {
      cursoDestino.estudiantes.push(estudianteId);
    }

    await cursoOrigen.save();
    await cursoDestino.save();

    console.log('✅ Estudiante transferido exitosamente');

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
