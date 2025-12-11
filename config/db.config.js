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
    dialect: process.env.DB_DIALECT,
    logging: false // Puedes poner 'true' para ver las consultas SQL
  }
);

// Función para probar la conexión
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos MySQL establecida correctamente.');
  } catch (error) {
    console.error('❌ Error de conexión a la base de datos:', error);
  }
}

// Sincronizar modelos con la base de datos (crear tablas si no existen)
async function syncModels() {
  try {
    await sequelize.sync({ alter: true }); // 'alter: true' ajusta las tablas sin borrarlas
    console.log('✨ Modelos de Sequelize sincronizados con la DB.');
  } catch (error) {
    console.error('❌ Error al sincronizar modelos:', error);
  }
}

module.exports = {
  sequelize,
  testConnection,
  syncModels
};