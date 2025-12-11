// archivo: config/db.config.js (VERSIÓN FINAL CON DATABASE_URL)
require('dotenv').config();
const { Sequelize } = require('sequelize');

// Render y otras plataformas de hosting en la nube (como Heroku)
// siempre proveen la URL completa de conexión en una variable llamada DATABASE_URL.

// Si la variable DATABASE_URL existe (Producción en Render), la usamos.
// Si no existe (Local), construimos la URL usando las variables separadas (opcional).
const connectionString = process.env.DATABASE_URL || 
  `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`;

// Crear la instancia de Sequelize
const sequelize = new Sequelize(
  connectionString, // 🛑 CRÍTICO: Usamos la URL completa aquí
  {
    // Render ya sabe que es PostgreSQL por la URL, pero lo forzamos.
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      // Necesario para conexiones SSL/TLS en la nube
      ssl: {
        require: true,
        rejectUnauthorized: false
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
    // Cambiamos el error a HostNotFoundError si es un problema de Hostname para mejor depuración
    throw error;
  }
}

// Sincronizar modelos con la base de datos
async function syncModels() {
  try {
    // { alter: true } asegura que las tablas se crean si no existen
    await sequelize.sync({ alter: true });
    console.log('✨ Modelos de Sequelize sincronizados con la DB.');
  } catch (error) {
    console.error('❌ Error al sincronizar modelos:', error);
    throw new Error("Fallo al crear tablas. Verifique logs.");
  }
}

module.exports = {
  sequelize,
  testConnection,
  syncModels
};