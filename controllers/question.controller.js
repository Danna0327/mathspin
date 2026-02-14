const Question = require("../models/question.model");

// Crear pregunta
exports.crearPregunta = async (req, res) => {
  try {
    const { titulo, pregunta, categoria, dificultad, opciones, respuestaCorrecta, imagen, tieneLatex } = req.body;
    
    console.log('📝 Creando pregunta:', { titulo, categoria, dificultad, opciones: opciones?.length });

    // Validación
    if (!titulo || !categoria || !dificultad || !opciones || !respuestaCorrecta) {
      console.error('❌ Faltan datos:', { titulo: !!titulo, categoria: !!categoria, dificultad: !!dificultad, opciones: !!opciones, respuestaCorrecta: !!respuestaCorrecta });
      return res.status(400).json({ 
        mensaje: "Faltan datos obligatorios",
        faltantes: {
          titulo: !titulo,
          categoria: !categoria,
          dificultad: !dificultad,
          opciones: !opciones,
          respuestaCorrecta: !respuestaCorrecta
        }
      });
    }

    if (!Array.isArray(opciones) || opciones.length !== 4) {
      return res.status(400).json({ 
        mensaje: "Debe haber exactamente 4 opciones" 
      });
    }

    const nuevaPregunta = new Question({
      titulo,
      pregunta: pregunta || titulo,
      categoria: categoria.toLowerCase().trim(),
      dificultad: dificultad.toLowerCase().trim(),
      opciones,
      respuestaCorrecta,
      docenteId: req.userId,  // ✅ Usar req.userId del middleware
      imagen,
      tieneLatex: tieneLatex || false,
      activa: true,
    });

    await nuevaPregunta.save();
    console.log('✅ Pregunta creada:', nuevaPregunta._id);

    res.status(201).json({
      mensaje: "Pregunta creada exitosamente",
      pregunta: nuevaPregunta,
    });
  } catch (error) {
    console.error("❌ Error al crear pregunta:", error);
    res.status(500).json({ 
      mensaje: "Error al crear pregunta", 
      error: error.message 
    });
  }
};

// Obtener todas las preguntas del docente
exports.obtenerPreguntasDocente = async (req, res) => {
  try {
    const { categoria, dificultad, busqueda } = req.query;
    
    console.log('📚 Obteniendo preguntas del docente:', req.userId);
    
    const filtros = { 
      docenteId: req.userId,
      activa: true 
    };
    
    if (categoria && categoria !== 'todas') {
      filtros.categoria = categoria.toLowerCase();
    }
    if (dificultad && dificultad !== 'todas') {
      filtros.dificultad = dificultad.toLowerCase();
    }
    if (busqueda) {
      filtros.$or = [
        { titulo: { $regex: busqueda, $options: 'i' } },
        { pregunta: { $regex: busqueda, $options: 'i' } }
      ];
    }

    const preguntas = await Question.find(filtros)
      .sort({ createdAt: -1 })
      .lean();
    
    console.log('✅ Preguntas encontradas:', preguntas.length);

    res.json(preguntas);
  } catch (error) {
    console.error('❌ Error obteniendo preguntas:', error);
    res.status(500).json({ 
      mensaje: 'Error al obtener preguntas',
      error: error.message 
    });
  }
};

// Obtener preguntas por categoría y dificultad (para el juego)
exports.getByCategoryAndDifficulty = async (req, res) => {
  try {
    const { categoria } = req.params;
    const { difficulty } = req.query;

    if (!categoria || !difficulty) {
      return res.status(400).json({ 
        mensaje: "Faltan parámetros: categoria y difficulty" 
      });
    }

    console.log(`🔍 Buscando preguntas: categoria=${categoria}, dificultad=${difficulty}`);

    const questions = await Question.find({
      categoria: categoria.toLowerCase().trim(),
      dificultad: difficulty.toLowerCase().trim(),
      activa: true,
    }).lean();

    console.log(`📊 Preguntas encontradas: ${questions.length}`);

    if (questions.length === 0) {
      return res.status(404).json({ 
        mensaje: "No se encontraron preguntas para esta categoría y dificultad" 
      });
    }

    // Normalizar formato
    const normalizedQuestions = questions.map((q) => ({
      _id: q._id,
      titulo: q.titulo || q.pregunta,
      opciones: q.opciones || [],
      respuestaCorrecta: q.respuestaCorrecta,
      categoria: q.categoria,
      dificultad: q.dificultad,
    }));

    res.json({ preguntas: normalizedQuestions });
  } catch (error) {
    console.error("❌ Error al obtener preguntas:", error);
    res.status(500).json({ 
      mensaje: "Error al obtener preguntas", 
      error: error.message 
    });
  }
};

// Actualizar pregunta
exports.actualizarPregunta = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, pregunta, categoria, dificultad, opciones, respuestaCorrecta, imagen, tieneLatex } = req.body;

    const preguntaExistente = await Question.findOne({
      _id: id,
      docenteId: req.userId
    });

    if (!preguntaExistente) {
      return res.status(404).json({ mensaje: "Pregunta no encontrada" });
    }

    const datosActualizados = {
      titulo: titulo || preguntaExistente.titulo,
      pregunta: pregunta || titulo || preguntaExistente.pregunta,
      categoria: categoria ? categoria.toLowerCase().trim() : preguntaExistente.categoria,
      dificultad: dificultad ? dificultad.toLowerCase().trim() : preguntaExistente.dificultad,
      opciones: opciones || preguntaExistente.opciones,
      respuestaCorrecta: respuestaCorrecta || preguntaExistente.respuestaCorrecta,
      imagen: imagen !== undefined ? imagen : preguntaExistente.imagen,
      tieneLatex: tieneLatex !== undefined ? tieneLatex : preguntaExistente.tieneLatex,
    };

    const preguntaActualizada = await Question.findByIdAndUpdate(
      id,
      datosActualizados,
      { new: true, runValidators: true }
    );

    res.json({
      mensaje: "Pregunta actualizada exitosamente",
      pregunta: preguntaActualizada,
    });
  } catch (error) {
    console.error("❌ Error al actualizar pregunta:", error);
    res.status(500).json({ 
      mensaje: "Error al actualizar pregunta",
      error: error.message 
    });
  }
};

// Eliminar pregunta
exports.eliminarPregunta = async (req, res) => {
  try {
    const { id } = req.params;

    const pregunta = await Question.findOneAndUpdate(
      { _id: id, docenteId: req.userId },
      { activa: false },
      { new: true }
    );

    if (!pregunta) {
      return res.status(404).json({ mensaje: "Pregunta no encontrada" });
    }

    res.json({ 
      mensaje: "Pregunta eliminada exitosamente",
      pregunta 
    });
  } catch (error) {
    console.error("❌ Error al eliminar pregunta:", error);
    res.status(500).json({ 
      mensaje: "Error al eliminar pregunta",
      error: error.message 
    });
  }
};
