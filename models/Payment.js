const { DataTypes } = require('sequelize');
const sequelize = require("../config/db_ecommerce")

const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    }, 
    transaction_id: {
      type: DataTypes.STRING,
       allowNull: true
    },
    external_reference: {
      type: DataTypes.STRING,
       allowNull: true
    },
    identificationNumber: {
      type: DataTypes.BIGINT,
       allowNull: true
    },
    cardholderEmail: {
      type: DataTypes.STRING,
       allowNull: true
    },
    paymentMethodId: {
      type: DataTypes.STRING,
       allowNull: true
    },
    status: {
      type: DataTypes.STRING,
       allowNull: true
    },
    description: {
      type: DataTypes.STRING,
       allowNull: true
    },
    amount: {
      type: DataTypes.DOUBLE,
       allowNull: true
    },
    installments: {
      type: DataTypes.INTEGER,
       allowNull: true
    }
});

const User = require('./User'); // importa o modelo da tabela de produtos
const Order = require('./Order'); // importa o modelo da tabela de produtos
const Cupom = require('./Cupom');
const Adm = require('./Adm');

User.hasMany(Payment);
Order.hasMany(Payment);

Payment.belongsTo(User);
Payment.belongsTo(Order);

Payment.belongsTo(Cupom, { allowNull: true });
Cupom.hasMany(Payment);

Payment.belongsTo(Adm, { allowNull: true });
Adm.hasMany(Payment);
// Payment.sync({force: true})        // Criação da Tabela

module.exports = Payment ;