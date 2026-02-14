const express = require("express");
const router = express.Router();
const Question = require("../models/question.model");
const authMiddleware = require("../middlewares/auth.middleware");

// ================================
// 🔐 TODAS REQUIEREN LOGIN
// ================================
router.use(authMiddleware);

// ================================
// 🔥 CREAR PREGUNTA
// POST /api/questions
// ================================
router.post("/", async (req, res) => {
  try {
    const { cursoId, categoria, dificultad, pregunta, opciones, respuestaCorrecta } = req.body;

    if (!cursoId || !categoria || !dificultad || !pregunta || !opciones || respuestaCorrecta === undefined) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
    }

    const nuevaPregunta = new Question({
      cursoId,
      categoria,
      dificultad,
      pregunta,
      opciones,
      respuestaCorrecta,
    });

    await nuevaPregunta.save();

    res.status(201).json({
      mensaje: "Pregunta creada correctamente",
      pregunta: nuevaPregunta,
    });

  } catch (error) {
    console.error("❌ Error creando pregunta:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

// ================================
// 🔥 OBTENER PREGUNTAS POR CATEGORÍA
// GET /api/questions/category/:category?difficulty=facil
// ================================
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const { difficulty } = req.query;

    const filter = { categoria: category };

    if (difficulty) {
      filter.dificultad = difficulty;
    }

    const preguntas = await Question.find(filter);

    res.json({ preguntas });

  } catch (error) {
    console.error("❌ Error obteniendo preguntas:", error);
    res.status(500).json({ mensaje: "Error obteniendo preguntas" });
  }
});

module.exports = router;

