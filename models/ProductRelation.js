const { DataTypes } = require('sequelize');
const sequelize = require("../config/db_ecommerce")


const ProductRelation = sequelize.define('ProductRelation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  }
}, {
  tableName: 'Product_Relation',
  timestamps: false, // desativa a criação automática das colunas createdAt e updatedAt
});

// Definição das associações da tabela Produtos-Images
const Product = require('./Product'); // importa o modelo da tabela de produtos
const Relation = require('./Relation'); // importa o modelo da tabela de Images

Product.belongsToMany(Relation, { 
  through: ProductRelation
});

Relation.belongsToMany(Product, { 
  through: ProductRelation
});


// ProductRelation.sync({force: true})        // Criação da Tabela

module.exports = ProductRelation;
