// Script para limpiar índices problemáticos de MongoDB
// Ejecutar: node limpiar-indices.js

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://maydenemadero:CvQ6KioPvmU8rUwZ@mathspincluster.luxk97t.mongodb.net/mathspin?retryWrites=true&w=majority';

async function limpiarIndices() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado');

    const db = mongoose.connection.db;
    const collection = db.collection('cursos');

    // Ver índices actuales
    console.log('\n📋 Índices actuales:');
    const indices = await collection.indexes();
    indices.forEach(idx => {
      console.log('  -', JSON.stringify(idx.key), '→', idx.name);
    });

    // Eliminar índices problemáticos
    console.log('\n🗑️ Eliminando índices problemáticos...');
    
    try {
      await collection.dropIndex('codigo_1');
      console.log('✅ Índice codigo_1 eliminado');
    } catch (e) {
      console.log('⚠️ codigo_1 no existe o ya fue eliminado');
    }

    try {
      await collection.dropIndex('codigoCurso_1');
      console.log('✅ Índice codigoCurso_1 eliminado');
    } catch (e) {
      console.log('⚠️ codigoCurso_1 no existe o ya fue eliminado');
    }

    // Crear el índice correcto
    console.log('\n📝 Creando índice correcto...');
    await collection.createIndex({ codigo: 1 }, { unique: true, sparse: true });
    console.log('✅ Índice codigo creado');

    // Ver índices finales
    console.log('\n📋 Índices finales:');
    const indicesFinales = await collection.indexes();
    indicesFinales.forEach(idx => {
      console.log('  -', JSON.stringify(idx.key), '→', idx.name);
    });

    console.log('\n✅ Limpieza completada exitosamente');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

limpiarIndices();
