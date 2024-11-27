const Sequelize = require('sequelize')
const sequelize = new Sequelize(
        process.env.DB_DATABASE,
        process.env.DB_USERNAME,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            dialect: process.env.DB_CONNECTION
        }
    );

sequelize.authenticate(
    console.log ("Banco de Dados Ecommerce - Conectado")
)
.catch((error) => (
    console.log ("Banco de Dados Ecommerce - Falha ao conectar -> " + error )
))

module.exports = sequelize;