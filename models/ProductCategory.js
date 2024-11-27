const { DataTypes } = require('sequelize');
const sequelize = require("../config/db_ecommerce")


// Definição do modelo da tabela Produtos-Category
const ProductCategory = sequelize.define('ProductCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
},
{
  tableName: 'Product_Category',
  timestamps: false, // desativa a criação automática das colunas createdAt e updatedAt
});


const Product = require('./Product');
const Category = require('./Category');

Product.belongsToMany(Category, { 
  through: ProductCategory
});

Category.belongsToMany(Product, { 
  through: ProductCategory
});

Product.hasMany(ProductCategory);

// ProductCategory.sync({force: true})        // Criação da Tabela

module.exports = ProductCategory;