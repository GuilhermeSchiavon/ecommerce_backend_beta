const { Model, DataTypes } = require('sequelize');
const sequelize = require("../config/db_ecommerce")

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  discount: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: true
  },
  model: {
    type: DataTypes.STRING,
    allowNull: true
  },
  sizeGuide: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  height: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  width: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  length: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  availability: {
    type: DataTypes.ENUM('em estoque', 'sob encomenda'),
    allowNull: false,
    defaultValue: 'em estoque'
  },
  status: {
    type: DataTypes.ENUM('ativo', 'inativo'),
    allowNull: false,
    defaultValue: 'ativo'
  }
});


// Product.sync({force: true})        // Criação da Tabela

module.exports = Product;