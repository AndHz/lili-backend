// archivo: models/Venta.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Venta = sequelize.define('Venta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fecha_venta: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, // Registra la fecha y hora de la venta
  },
  cliente_nombre: {
    type: DataTypes.STRING(150),
    allowNull: true, // Puede ser opcional si el cliente no quiere dar su nombre
  },
  total_pagado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  ganancia_neta: { // La suma de las utilidades de todos los DetalleVenta
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  estado: { // Para rastrear el pedido
    type: DataTypes.ENUM('Pendiente Pago', 'Pagada', 'Enviada', 'Entregada'),
    allowNull: false,
    defaultValue: 'Pagada',
  }
}, {
  tableName: 'ventas',
  timestamps: true,
});

module.exports = Venta;