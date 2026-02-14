const mongoose = require("mongoose");

const cursoSchema = new mongoose.Schema({
  nombreCurso: {
    type: String,
    required: true,
  },
  codigoCurso: {
    type: String,
    required: true,
    unique: true,
  },
  docenteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  estudiantes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Curso", cursoSchema);
