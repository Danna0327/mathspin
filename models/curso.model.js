const mongoose = require("mongoose");

const cursoSchema = new mongoose.Schema({
  nombreCurso: {
    type: String,
    required: true,
  },
  codigo: {  // ✅ Cambio: codigoCurso → codigo
    type: String,
    required: true,
    unique: true,
  },
  codigoCurso: {  // ✅ Alias para compatibilidad
    type: String,
    get() {
      return this.codigo;
    },
    set(value) {
      this.codigo = value;
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
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true }
});

module.exports = mongoose.model("Curso", cursoSchema);
