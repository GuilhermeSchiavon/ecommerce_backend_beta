const { DataTypes } = require('sequelize');
const sequelize = require("../config/db_ecommerce")


const ProductImage = sequelize.define('ProductImage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  }
}, {
  tableName: 'Product_Image',
  timestamps: false, // desativa a criação automática das colunas createdAt e updatedAt
});

// Definição das associações da tabela Produtos-Images
const Product = require('./Product'); // importa o modelo da tabela de produtos
const Image = require('./Image'); // importa o modelo da tabela de Images

Product.belongsToMany(Image, { 
  through: ProductImage
});

Image.belongsToMany(Product, { 
  through: ProductImage
});



// ProductImage.sync({force: true})        // Criação da Tabela

module.exports = ProductImage;
