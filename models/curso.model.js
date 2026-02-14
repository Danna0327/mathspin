const mongoose = require("mongoose");

const cursoSchema = new mongoose.Schema({
  nombreCurso: {
    type: String,
    required: true,
  },
  codigo: {  // ✅ Campo principal
    type: String,
    required: true,
    unique: true,
    sparse: true  // Permite null pero solo uno
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
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para compatibilidad con frontend que usa codigoCurso
cursoSchema.virtual('codigoCurso').get(function() {
  return this.codigo;
});

cursoSchema.virtual('codigoCurso').set(function(value) {
  this.codigo = value;
});

// Índice
cursoSchema.index({ docenteId: 1 });

module.exports = mongoose.model("Curso", cursoSchema);
