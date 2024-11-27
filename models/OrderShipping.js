const { DataTypes } = require('sequelize');
const sequelize = require("../config/db_ecommerce")

const OrderShipping = sequelize.define('OrderShipping', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  order_protocol: {
    type: DataTypes.STRING,
    allowNull: true
  },
  transaction_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  transaction_protocol: {
    type: DataTypes.STRING,
    allowNull: true
  },
  service_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  delivery_min: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  delivery_max: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  tracking: {
    type: DataTypes.STRING,
    allowNull: true
  },
  print: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true
  },
},
{
    tableName: 'Order_Shipping',
});


const Order = require('./Order');

OrderShipping.belongsTo(Order);
Order.hasMany(OrderShipping);

// OrderShipping.sync({force: true})        // Criação da Tabela

module.exports = OrderShipping;