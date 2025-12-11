const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Inventario = sequelize.define('Inventario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cantidad_stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  ubicacion: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
}, {
  tableName: 'inventario',
  timestamps: false,
});

module.exports = Inventario;