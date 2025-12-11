// archivo: server.js (CÓDIGO COMPLETO Y FINAL)

require('dotenv').config(); // Cargar variables de entorno del archivo .env
const express = require('express');
const cors = require('cors'); // Requerido para permitir la conexión desde el Frontend (http://localhost:3000)
const app = express();
const PORT = process.env.PORT || 5000;

// Importar la configuración de la Base de Datos y Sequelize
const { testConnection, syncModels } = require('./config/db.config');

// Importar los modelos (Esto es crucial para que Sequelize los conozca y sincronice)
const db = require('./models'); 

// Importar los archivos de Rutas de cada módulo
const productoRoutes = require('./routes/product.routes');
const ventaRoutes = require('./routes/venta.routes');
const reporteRoutes = require('./routes/reporte.routes'); 

// --- 1. Middleware Global y CORS ---
// Habilitar CORS para aceptar peticiones de otros orígenes (como Next.js en puerto 3000)
app.use(cors()); 

// Middleware para permitir que Express lea el cuerpo de las peticiones en formato JSON
app.use(express.json()); 

// Middleware para manejar datos codificados en URL 
app.use(express.urlencoded({ extended: true }));

// --- 2. Rutas Principales ---

// Ruta de prueba simple
app.get('/', (req, res) => {
  res.send('API de Gestión de Catálogos activa. Visita /api/productos, /api/ventas y /api/reportes');
});

// Conectar el Módulo de Inventario (CRUD de Productos)
app.use('/api/productos', productoRoutes); 

// Conectar el Módulo de Ventas (CRUD y Lógica de Transacción)
app.use('/api/ventas', ventaRoutes); 

// Conectar el Módulo de Reportes (Ganancias y Rentabilidad)
app.use('/api/reportes', reporteRoutes); 

// --- 3. Inicializar Servidor y Base de Datos ---
async function startServer() {
  try {
    // Probar la conexión a MySQL
    await testConnection(); 
    
    // Sincronizar todos los modelos (crea o altera las tablas si es necesario)
    await syncModels();     
    
    // Levantar el servidor Express.js
    app.listen(PORT, () => {
      console.log(`🚀 Servidor Express.js corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Fallo crítico al iniciar el servidor o la DB:", error.message);
    // Terminar el proceso si hay un error grave de conexión o sincronización
    process.exit(1); 
  }
}

startServer();