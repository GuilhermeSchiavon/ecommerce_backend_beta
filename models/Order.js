const { Model, DataTypes } = require('sequelize');
const sequelize = require("../config/db_ecommerce")

const Order = sequelize.define('Order', {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  notaFiscal: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deliveryAddress: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  shippingMethod: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  totalAmount: {
    type: DataTypes.DOUBLE,
     allowNull: false
  },
  orderStatus: {
    type: DataTypes.ENUM('pendente', 'aguardando', 'enviado', 'entregue', 'cancelado', 'devolvido', 'reembolsado'),
    allowNull: false,
    defaultValue: 'pendente'
  }
  
});

const User = require('./User');
const UserAddress = require('./UserAddress');
const ShippingMethod = require('./ShippingMethod');

User.hasMany(Order);
UserAddress.hasMany(Order);
ShippingMethod.hasMany(Order);

Order.belongsTo(User);
Order.belongsTo(UserAddress);
Order.belongsTo(ShippingMethod);


// Order.sync({force: true})        // Criação da Tabela

module.exports = Order;
