const { DataTypes } = require('sequelize');
const sequelize = require("../config/db_ecommerce")


// Definição do modelo da tabela Produtos-Tags
const ProductTag = sequelize.define('ProductTag', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
}, {
  tableName: 'Product_Tag',
  timestamps: false, // desativa a criação automática das colunas createdAt e updatedAt
});

// Definição das associações da tabela Produtos-Tags
const Product = require('./Product'); // importa o modelo da tabela de produtos
const Tag = require('./Tag'); // importa o modelo da tabela de tags

Product.belongsToMany(Tag, { 
  through: ProductTag
});

Tag.belongsToMany(Product, { 
  through: ProductTag
});

Product.hasMany(ProductTag);

// ProductTag.sync({force: true})        // Criação da Tabela

module.exports = ProductTag;