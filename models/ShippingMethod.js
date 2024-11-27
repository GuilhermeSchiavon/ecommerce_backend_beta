const { DataTypes } = require('sequelize');
const sequelize = require("../config/db_ecommerce")


const ShippingMethod = sequelize.define('ShippingMethod', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('ativo', 'inativo'),
    allowNull: false,
    defaultValue: 'ativo'
  }
}, 
{
  timestamps: false
});

// ShippingMethod.sync({force: true})        // Criação da Tabela

module.exports = ShippingMethod;