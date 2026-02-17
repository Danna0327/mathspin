const Usuario = require("../models/user.model");
const Curso = require("../models/curso.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "clave_secreta_super_segura";

// ================================
// REGISTRAR USUARIO
// ================================
exports.registrarUsuario = async (req, res) => {
  try {
    const { nombre, apellido, nombreUsuario, contrasena, rol, paralelo, codigoCurso } = req.body;

    const existe = await Usuario.findOne({ nombreUsuario });
    if (existe) return res.status(400).json({ mensaje: "Nombre de usuario ya registrado" });

    const hash = await bcrypt.hash(contrasena, 10);

    let cursoId = null;
    if (rol === "estudiante" && codigoCurso) {
      // ✅ Buscar por codigoCurso O codigo
      const curso = await Curso.findOne({
        $or: [{ codigoCurso }, { codigo: codigoCurso }]
      });
      if (!curso) return res.status(400).json({ mensaje: "Código de curso inválido" });
      cursoId = curso._id;
    }

    const nuevoUsuario = new Usuario({
      nombre,
      apellido,
      nombreUsuario,
      contrasena: hash,
      rol,
      paralelo: rol === "estudiante" ? paralelo : null,
      cursoId,
      codigoCurso: rol === "estudiante" ? codigoCurso : null,
    });

    await nuevoUsuario.save();

    // ✅ Agregar estudiante al array del curso
    if (cursoId) {
      await Curso.findByIdAndUpdate(
        cursoId,
        { $addToSet: { estudiantes: nuevoUsuario._id } }
      );
      console.log(`✅ Estudiante ${nombreUsuario} agregado al curso ${cursoId}`);
    }

    res.status(201).json({ mensaje: "Usuario registrado correctamente" });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ mensaje: "Error al registrar usuario", error: error.message });
  }
};

// ================================
// INICIAR SESIÓN
// ================================
exports.iniciarSesion = async (req, res) => {
  try {
    const { nombreUsuario, contrasena } = req.body;
    const usuario = await Usuario.findOne({ nombreUsuario });

    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    const valid = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!valid) return res.status(401).json({ mensaje: "Contraseña incorrecta" });

    const token = jwt.sign({ id: usuario._id, rol: usuario.rol }, SECRET, { expiresIn: "2h" });

    res.json({
      mensaje: "Inicio de sesión exitoso",
      token,
      rol: usuario.rol,
      id: usuario._id.toString(),
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      paralelo: usuario.paralelo,
      tieneCurso: !!usuario.cursoId,  // ✅ Indica si ya tiene curso
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ mensaje: "Error al iniciar sesión", error: error.message });
  }
};

// ================================
// UNIRSE A CURSO (después del login)
// ================================
exports.unirseACurso = async (req, res) => {
  try {
    const { codigoCurso } = req.body;
    const estudianteId = req.userId;

    if (!codigoCurso) {
      return res.status(400).json({ mensaje: "El código del curso es obligatorio" });
    }

    // Buscar curso por codigoCurso o codigo
    const curso = await Curso.findOne({
      $or: [{ codigoCurso }, { codigo: codigoCurso }]
    });

    if (!curso) {
      return res.status(404).json({ mensaje: "Código de curso inválido. Verifica e intenta de nuevo." });
    }

    // Verificar si ya está en el curso
    const yaEstaEnCurso = curso.estudiantes.some(
      id => id.toString() === estudianteId.toString()
    );

    if (yaEstaEnCurso) {
      return res.status(400).json({ 
        mensaje: "Ya estás inscrito en este curso",
        curso: { nombre: curso.nombreCurso, codigo: codigoCurso }
      });
    }

    // Agregar estudiante al curso
    await Curso.findByIdAndUpdate(
      curso._id,
      { $addToSet: { estudiantes: estudianteId } }
    );

    // Actualizar cursoId en el usuario
    await Usuario.findByIdAndUpdate(
      estudianteId,
      { 
        cursoId: curso._id,
        codigoCurso: codigoCurso
      }
    );

    console.log(`✅ Estudiante ${estudianteId} unido al curso ${curso.nombreCurso}`);

    res.json({
      mensaje: `¡Te uniste exitosamente al curso "${curso.nombreCurso}"!`,
      curso: {
        id: curso._id,
        nombre: curso.nombreCurso,
        codigo: codigoCurso
      }
    });

  } catch (error) {
    console.error("❌ Error al unirse al curso:", error);
    res.status(500).json({ mensaje: "Error al unirse al curso", error: error.message });
  }
};

// ================================
// OBTENER PERFIL
// ================================
exports.obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.user.id).select("-contrasena");
    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });
    res.json(usuario);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ mensaje: "Error al obtener perfil", error: error.message });
  }
};
