const { DataTypes } = require('sequelize');
const sequelize = require("../config/db_ecommerce")
// Tabela de Comentários
const Reviews = sequelize.define('Reviews', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  status: {
    type: DataTypes.ENUM('ativo', 'inativo'),
    allowNull: false,
    defaultValue: 'ativo'
  }
});

// Relacionamento entre Usuários e Comentários
const User = require('./User');
Reviews.belongsTo(User);
User.hasMany(Reviews)

// // Relacionamento entre Produtos e Comentários
const Product = require('./Product');
Reviews.belongsTo(Product);
Product.hasMany(Reviews)

// Reviews.sync({force: true})        // Criação da Tabela

module.exports = Reviews;

