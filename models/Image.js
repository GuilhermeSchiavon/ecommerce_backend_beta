const { DataTypes } = require('sequelize');
const sequelize = require("../config/db_ecommerce")


const Image = sequelize.define('Image', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('produto', 'banner'),
    allowNull: false,
    defaultValue: 'produto'
  },
}, {
  timestamps: false, // desativa a criação automática das colunas createdAt e updatedAt
});


// Image.sync({force: true})        // Criação da Tabela

module.exports = Image;
