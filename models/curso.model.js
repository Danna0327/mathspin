const mongoose = require("mongoose");

const cursoSchema = new mongoose.Schema({
  // Campo legacy (mantener para compatibilidad)
  nombreCurso: {
    type: String,
    required: true,
  },
  
  // Nuevos campos separados
  nombre: {
    type: String,
    required: false, // Opcional para cursos viejos
  },
  nivel: {
    type: String,
    required: false,
  },
  paralelo: {
    type: String,
    required: false,
  },
  
  codigoCurso: {
    type: String,
    required: true,
    unique: true,
  },
  codigo: {
    type: String,
    required: false,
  },
  
  // Categorías activas para este curso (para la ruleta)
  categoriasActivas: {
    type: [String],
    default: ['algebra', 'geometria', 'estadistica', 'numeros', 'funciones', 'trigonometria']
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

// Middleware para generar nombreCurso automáticamente si tiene campos separados
cursoSchema.pre('save', function(next) {
  if (this.nombre && this.nivel && this.paralelo) {
    this.nombreCurso = `${this.nombre} ${this.nivel}° ${this.paralelo}`;
  }
  
  // Sincronizar codigo con codigoCurso
  if (this.codigoCurso && !this.codigo) {
    this.codigo = this.codigoCurso;
  }
  
  next();
});

module.exports = mongoose.model("Curso", cursoSchema);
