// archivo: models/index.js (Actualizado)

const { sequelize } = require('../config/db.config'); // Importamos la instancia de sequelize
const Producto = require('./Producto');
const Inventario = require('./Inventario');
const Venta = require('./Venta');
const DetalleVenta = require('./DetalleVenta');

// --- 1. Relaciones de Inventario ---
// Producto <--> Inventario (Relación 1 a 1)
Producto.hasOne(Inventario, { foreignKey: 'productoId', onDelete: 'CASCADE' });
Inventario.belongsTo(Producto, { foreignKey: 'productoId' });

// --- 2. Relaciones de Venta ---

// Venta <--> DetalleVenta (Relación 1 a N: Una Venta tiene muchos Detalles)
Venta.hasMany(DetalleVenta, { foreignKey: 'ventaId', as: 'detalles', onDelete: 'CASCADE' });
DetalleVenta.belongsTo(Venta, { foreignKey: 'ventaId' });

// Producto <--> DetalleVenta (Relación 1 a N: Un Producto puede estar en muchos Detalles de Venta)
Producto.hasMany(DetalleVenta, { foreignKey: 'productoId' });
DetalleVenta.belongsTo(Producto, { foreignKey: 'productoId' });

// Exportar todos los modelos y sequelize
module.exports = {
  sequelize, // Exportamos para facilitar accesos avanzados si se requieren
  Producto,
  Inventario,
  Venta,
  DetalleVenta,
};