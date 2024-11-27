const { DataTypes } = require('sequelize');
const sequelize = require("../config/db_ecommerce")

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unitPrice: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
},
{
    tableName: 'Order_Item',
});


const Order = require('./Order');
const Product = require('./Product');

OrderItem.belongsTo(Order);
OrderItem.belongsTo(Product);

Order.hasMany(OrderItem);
Product.hasMany(OrderItem)

// OrderItem.sync({force: true})        // Criação da Tabela

module.exports = OrderItem;