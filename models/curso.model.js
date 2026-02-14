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
  codigo: {  // ✅ Campo dummy para satisfacer el índice viejo
    type: String,
    required: false,
    default: function() {
      return this.codigoCurso; // Copiar valor de codigoCurso
    }
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
  timestamps: true 
});

// Middleware pre-save para sincronizar codigo con codigoCurso
cursoSchema.pre('save', function(next) {
  if (this.codigoCurso && !this.codigo) {
    this.codigo = this.codigoCurso;
  }
  next();
});

module.exports = mongoose.model("Curso", cursoSchema);
