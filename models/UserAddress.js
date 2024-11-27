const { Model, DataTypes } = require('sequelize');
const sequelize = require("../config/db_ecommerce")

const UserAddress = sequelize.define('UserAddress', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  street: {
    type: DataTypes.STRING,
    allowNull: false
  },
  number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  complement: {
    type: DataTypes.STRING,
    allowNull: true
  },
  zip: {
    type: DataTypes.STRING,
    allowNull: true
  },
  neighborhood: {
    type: DataTypes.STRING,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false
  },
  default: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
},
{
  tableName: 'User_Address',
  timestamps: false, // desativa a criação automática das colunas createdAt e updatedAt
});


const User = require('./User'); 

User.hasMany(UserAddress, { as: 'addresses' });

UserAddress.belongsTo(User);

// UserAddress.sync({force: true})        // Criação da Tabela

module.exports = UserAddress;