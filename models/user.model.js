const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    nombreUsuario: { type: String, required: true, unique: true },
    contrasena: { type: String, required: true },
    rol: { type: String, enum: ["estudiante", "docente", "admin"], required: true },

    // Campos específicos para estudiantes
    nivel: { type: String }, // 8°, 9°, 10°, 1BGU, 2BGU, 3BGU
    paralelo: { type: String }, // A, B, C, D, E, F
    cursoId: { type: mongoose.Schema.Types.ObjectId, ref: "Curso" },
    codigoCurso: { type: String },

    // Campos adicionales
    ultimaConexion: { type: Date, default: Date.now },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Usuario", userSchema)
