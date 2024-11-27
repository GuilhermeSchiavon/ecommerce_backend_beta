const { Model, DataTypes } = require('sequelize');
const sequelize = require("../config/db_ecommerce")

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  cpf: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastActiveAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  accountStatus: {
    type: DataTypes.ENUM('ativa', 'inativa', 'pendente','banida'),
    allowNull: false,
    defaultValue: 'pendente'
  },
  permissions: {
    type: DataTypes.ENUM('user', 'moderator', 'admin'),
    allowNull: false,
    defaultValue: 'user'
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// User.sync({force: true})        // Criação da Tabela


module.exports = User;
