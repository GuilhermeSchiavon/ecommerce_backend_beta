const { DataTypes } = require('sequelize');
const sequelize = require("../config/db_ecommerce")


const ProductAttribute = sequelize.define('ProductAttribute', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    }, 
},
{
    tableName: 'Product_Attribute',
    timestamps: false
});


// Definição das associações da tabela Produtos-Tags
const Product = require('./Product'); // importa o modelo da tabela de produtos
const Attribute = require('./Attribute'); // importa o modelo da tabela de tags

Product.belongsToMany(Attribute, { 
  through: ProductAttribute
});

Attribute.belongsToMany(Product, { 
  through: ProductAttribute
});

// ProductAttribute .sync({force: true})        // Criação da Tabela

module.exports = ProductAttribute ;