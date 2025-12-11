// archivo: config/db.config.js
require('dotenv').config();
const { Sequelize } = require('sequelize');

// Crear la instancia de Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    // 🛑 CAMBIO CLAVE 1: Usamos postgres
    dialect: 'postgres', 
    logging: false, 
    // 🛑 CAMBIO CLAVE 2: Configuración SSL requerida por Render/Cloud DBs
    dialectOptions: {
        ssl: {
            require: true, 
            rejectUnauthorized: false // Permite la conexión sin certificado CA estricto
        }
    }
  }
);

// Función para probar la conexión
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos PostgreSQL establecida correctamente.');
  } catch (error) {
    console.error('❌ Error de conexión a la base de datos:', error);
    // No salimos del proceso aquí, esperamos la sincronización
  }
}

// Sincronizar modelos con la base de datos 
async function syncModels() {
  try {
    await sequelize.sync({ alter: true }); 
    console.log('✨ Modelos de Sequelize sincronizados con la DB.');
  } catch (error) {
    console.error('❌ Error al sincronizar modelos:', error);
    // Salimos del proceso si hay un error al sincronizar (la app no puede funcionar)
    throw new Error("Fallo al crear tablas. Verifique logs.");
  }
}

module.exports = {
  sequelize,
  testConnection,
  syncModels
};