require("dotenv").config();
const mongoose = require("mongoose");

console.log("URI usada:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ CONEXIÓN EXITOSA A MONGODB ATLAS");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ ERROR DE CONEXIÓN:", err.message);
    process.exit(1);
  });
