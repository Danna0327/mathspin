const Curso = require("../models/curso.model");
const Usuario = require("../models/user.model");
const Session = require("../models/session.model");

// ================================
// CREAR CURSO
// ================================
exports.crearCurso = async (req, res) => {
  try {
    const { nombreCurso, nombre, nivel, paralelo, codigoCurso, categoriasActivas } = req.body;

    // Aceptar tanto el formato viejo (nombreCurso) como el nuevo (nombre, nivel, paralelo)
    if (!codigoCurso || (!nombreCurso && (!nombre || !nivel || !paralelo))) {
      return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }

    const cursoExistente = await Curso.findOne({
      $or: [{ codigoCurso }, { codigo: codigoCurso }]
    });

    if (cursoExistente) {
      return res.status(400).json({ mensaje: "El código ya existe, intenta nuevamente" });
    }

    const nuevoCurso = new Curso({
      nombreCurso: nombreCurso || `${nombre} ${nivel}° ${paralelo}`,
      nombre,
      nivel,
      paralelo,
      codigoCurso,
      codigo: codigoCurso,
      categoriasActivas: categoriasActivas || ['algebra', 'geometria', 'estadistica', 'numeros', 'funciones', 'trigonometria'],
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
// EDITAR CURSO
// ================================
exports.editarCurso = async (req, res) => {
  try {
    const { cursoId } = req.params;
    const { nombre, nivel, paralelo, categoriasActivas } = req.body;

    if (!nombre || !nivel || !paralelo) {
      return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }

    const curso = await Curso.findOne({ _id: cursoId, docenteId: req.userId });
    if (!curso) {
      return res.status(404).json({ mensaje: "Curso no encontrado" });
    }

    // Actualizar campos
    curso.nombre = nombre;
    curso.nivel = nivel;
    curso.paralelo = paralelo;
    curso.nombreCurso = `${nombre} ${nivel}° ${paralelo}`;
    
    if (categoriasActivas && Array.isArray(categoriasActivas)) {
      curso.categoriasActivas = categoriasActivas;
    }

    await curso.save();
    console.log('✅ Curso editado:', cursoId);

    res.json({ mensaje: "Curso actualizado correctamente", curso });

  } catch (error) {
    console.error("❌ Error al editar curso:", error);
    res.status(500).json({ mensaje: "Error del servidor", error: error.message });
  }
};

// ================================
// OBTENER CURSOS DEL DOCENTE
// ================================
exports.obtenerCursosDocente = async (req, res) => {
  try {
    console.log('📚 Obteniendo cursos del docente:', req.userId);
    const cursos = await Curso.find({ docenteId: req.userId }).sort({ createdAt: -1 }).lean();
    console.log('✅ Cursos encontrados:', cursos.length);
    res.json(cursos);
  } catch (error) {
    console.error('❌ Error obteniendo cursos:', error);
    res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
  }
};

// ================================
// OBTENER ESTUDIANTES DEL DOCENTE (todos, agrupados por curso)
// ================================
exports.obtenerEstudiantesDocente = async (req, res) => {
  try {
    const cursos = await Curso.find({ docenteId: req.userId }).sort({ createdAt: -1 }).lean();

    if (cursos.length === 0) return res.json({ cursos: [], totalEstudiantes: 0 });

    const todosLosIds = cursos.flatMap(c => c.estudiantes || []);
    const idsUnicos = [...new Set(todosLosIds.map(id => id.toString()))];

    const estudiantes = await Usuario.find({ _id: { $in: idsUnicos } }, { contrasena: 0 }).lean();
    const mapaEstudiantes = {};
    estudiantes.forEach(est => { mapaEstudiantes[est._id.toString()] = est; });

    const cursosConEstudiantes = cursos.map(curso => {
      const codigo = curso.codigoCurso || curso.codigo || 'SIN-CODIGO';
      const estudiantesCurso = (curso.estudiantes || []).map(id => mapaEstudiantes[id.toString()]).filter(Boolean);
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
          createdAt: est.createdAt
        }))
      };
    });

    res.json({ cursos: cursosConEstudiantes, totalEstudiantes: idsUnicos.length });
  } catch (error) {
    console.error('❌ Error obteniendo estudiantes:', error);
    res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
  }
};

// ================================
// ANALYTICS DE UN CURSO ESPECÍFICO
// ================================
exports.obtenerAnalyticsCurso = async (req, res) => {
  try {
    const { cursoId } = req.params;
    const { periodo = 'mes' } = req.query;

    console.log(`📊 Analytics curso ${cursoId}, periodo: ${periodo}`);

    const curso = await Curso.findOne({ _id: cursoId, docenteId: req.userId }).lean();
    if (!curso) return res.status(404).json({ mensaje: 'Curso no encontrado' });

    // Fecha de inicio según periodo
    const fechaInicio = new Date();
    switch (periodo) {
      case 'semana':    fechaInicio.setDate(fechaInicio.getDate() - 7); break;
      case 'trimestre': fechaInicio.setMonth(fechaInicio.getMonth() - 3); break;
      case 'año':       fechaInicio.setFullYear(fechaInicio.getFullYear() - 1); break;
      default:          fechaInicio.setMonth(fechaInicio.getMonth() - 1); // mes
    }

    const estudianteIds = curso.estudiantes || [];

    // Sesiones del periodo
    const sesiones = await Session.find({
      usuarioId: { $in: estudianteIds },
      createdAt: { $gte: fechaInicio }
    }).lean();

    // KPIs básicos
    const totalSesiones = sesiones.length;
    const promedioGeneral = totalSesiones > 0
      ? Math.round(sesiones.reduce((s, x) => s + (x.porcentaje || 0), 0) / totalSesiones)
      : 0;
    const tiempoPromedio = totalSesiones > 0
      ? Math.round(sesiones.reduce((s, x) => s + (x.duracion || 0), 0) / totalSesiones)
      : 0;

    // Rendimiento por categoría
    const catMap = {};
    sesiones.forEach(s => {
      const cat = s.categoria || 'otras';
      if (!catMap[cat]) catMap[cat] = { suma: 0, n: 0 };
      catMap[cat].suma += (s.porcentaje || 0);
      catMap[cat].n++;
    });
    const rendimientoCategorias = Object.entries(catMap)
      .map(([nombre, d]) => ({ nombre, promedio: Math.round(d.suma / d.n), sesiones: d.n }))
      .sort((a, b) => b.promedio - a.promedio);

    // Stats por estudiante
    const estMap = {};
    sesiones.forEach(s => {
      const id = s.usuarioId.toString();
      if (!estMap[id]) estMap[id] = { suma: 0, n: 0 };
      estMap[id].suma += (s.porcentaje || 0);
      estMap[id].n++;
    });

    // Datos de usuarios
    const datosUsuarios = await Usuario.find(
      { _id: { $in: estudianteIds } },
      { nombre: 1, apellido: 1, nombreUsuario: 1, paralelo: 1 }
    ).lean();
    const mapaUsuarios = {};
    datosUsuarios.forEach(u => { mapaUsuarios[u._id.toString()] = u; });

    // Top 5 estudiantes
    const topEstudiantes = Object.entries(estMap)
      .map(([id, d]) => ({
        ...mapaUsuarios[id],
        promedio: Math.round(d.suma / d.n),
        sesiones: d.n
      }))
      .filter(e => e.nombre)
      .sort((a, b) => b.promedio - a.promedio)
      .slice(0, 5);

    // Sesiones recientes con nombre
    const sesionesRecientes = sesiones
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(s => ({
        ...s,
        nombreEstudiante: (() => {
          const u = mapaUsuarios[s.usuarioId.toString()];
          return u ? `${u.nombre} ${u.apellido}` : 'Estudiante';
        })()
      }));

    res.json({
      curso: { id: curso._id, nombre: curso.nombreCurso },
      kpis: {
        totalEstudiantes: estudianteIds.length,
        totalSesiones,
        promedioGeneral,
        tiempoPromedio
      },
      rendimientoCategorias,
      topEstudiantes,
      sesionesRecientes
    });

  } catch (error) {
    console.error('❌ Error en analytics:', error);
    res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
  }
};

// ================================
// OBTENER CATEGORÍAS ACTIVAS DEL CURSO DEL ESTUDIANTE
// ================================
exports.obtenerCategoriasActivas = async (req, res) => {
  try {
    const estudianteId = req.userId;
    
    // Buscar el usuario para obtener su cursoId
    const estudiante = await Usuario.findById(estudianteId).lean();
    if (!estudiante || !estudiante.cursoId) {
      // Si no tiene curso, devolver todas las categorías
      return res.json({ 
        categorias: ['algebra', 'geometria', 'estadistica', 'numeros', 'funciones', 'trigonometria']
      });
    }
    
    // Buscar el curso
    const curso = await Curso.findById(estudiante.cursoId).lean();
    if (!curso) {
      return res.json({ 
        categorias: ['algebra', 'geometria', 'estadistica', 'numeros', 'funciones', 'trigonometria']
      });
    }
    
    const categorias = curso.categoriasActivas || ['algebra', 'geometria', 'estadistica', 'numeros', 'funciones', 'trigonometria'];
    res.json({ categorias });
    
  } catch (error) {
    console.error('❌ Error obteniendo categorías:', error);
    res.json({ 
      categorias: ['algebra', 'geometria', 'estadistica', 'numeros', 'funciones', 'trigonometria']
    });
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
    await Curso.findByIdAndUpdate(cursoId, { $pull: { estudiantes: estudianteId } });
    res.json({ mensaje: 'Estudiante eliminado del curso' });
  } catch (error) {
    console.error('❌ Error eliminando estudiante:', error);
    res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
  }
};
