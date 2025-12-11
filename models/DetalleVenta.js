// archivo: models/DetalleVenta.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const DetalleVenta = sequelize.define('DetalleVenta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  precio_final_unitario: { // Precio al que realmente vendiste este artículo (puede diferir del sugerido)
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  costo_unitario: { // Copia del costo_compra del Producto en el momento de la venta
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  utilidad_unitario: { // (precio_final_unitario - costo_unitario)
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  tableName: 'detalle_ventas',
  timestamps: false,
});

module.exports = DetalleVenta;