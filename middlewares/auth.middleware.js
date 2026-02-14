const jwt = require("jsonwebtoken");
const Usuario = require("../models/user.model");

const SECRET = process.env.JWT_SECRET || "clave_secreta_super_segura";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      console.log('❌ No se proporcionó token');
      return res.status(401).json({ mensaje: "Token no proporcionado" });
    }

    console.log('🔍 Token recibido:', token.substring(0, 20) + '...');

    const decoded = jwt.verify(token, SECRET);
    console.log('✅ Token decodificado:', decoded);

    const usuario = await Usuario.findById(decoded.id);

    if (!usuario) {
      console.log('❌ Usuario no encontrado en BD');
      return res.status(401).json({ mensaje: "Usuario no encontrado" });
    }

    console.log('✅ Usuario autenticado:', usuario._id, usuario.nombreUsuario);

    // ✅ FIX CRÍTICO: Agregar AMBOS para compatibilidad
    req.user = usuario;
    req.userId = usuario._id; // ← ESTO FALTABA
    
    next();
  } catch (error) {
    console.error('❌ Error en auth middleware:', error.message);
    res.status(401).json({ mensaje: "Token inválido" });
  }
};

module.exports = authMiddleware;
