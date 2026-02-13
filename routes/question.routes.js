const express = require("express");
const router = express.Router();
const Question = require("../models/question.model");

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
