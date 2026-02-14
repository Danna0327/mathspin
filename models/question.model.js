const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  titulo: { 
    type: String, 
    required: true 
  },
  pregunta: {  // Alias para compatibilidad
    type: String
  },
  opciones: { 
    type: [String], 
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length === 4;
      },
      message: 'Debe haber exactamente 4 opciones'
    }
  },
  respuestaCorrecta: { 
    type: String, 
    required: true 
  },
  categoria: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true
  },
  dificultad: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true
  },
  docenteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false  // Opcional para preguntas del sistema
  },
  imagen: {
    type: String,
    required: false
  },
  tieneLatex: {
    type: Boolean,
    default: false
  },
  activa: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

// Índices
questionSchema.index({ categoria: 1, dificultad: 1 });
questionSchema.index({ docenteId: 1 });

module.exports = mongoose.model("Question", questionSchema);
