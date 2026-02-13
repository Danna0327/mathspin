const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  opciones: { type: [String], required: true },
  respuestaCorrecta: { type: String, required: true },
  categoria: { type: String, required: true },
  dificultad: { type: String, required: true },
});

module.exports = mongoose.model("Question", questionSchema);
