const { Model, DataTypes } = require('sequelize');
const sequelize = require("../config/db_ecommerce")

const Relation = sequelize.define('Relation', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('ativo', 'inativo'),
    allowNull: false,
    defaultValue: 'ativo'
  }
});

// Relation.sync({force: true})        // Criação da Tabela

module.exports = Relation;