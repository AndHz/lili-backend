const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Producto = sequelize.define('Producto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  marca: {
    type: DataTypes.ENUM('Yanbal', 'Esika', 'Cyzone', 'Lbel', 'Otra'),
    allowNull: false,
  },
  codigo_catalogo: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
  },
  costo_compra: { // Campo para calcular la utilidad
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  precio_sugerido: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  }
}, {
  tableName: 'productos',
  timestamps: true, // Agrega createdAt y updatedAt
});

module.exports = Producto;