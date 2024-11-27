// Configuração Inicial
require('dotenv').config();

const cors = require('cors')
const express = require('express');
const app = express();

    app.use(cors({
        origin: [
            "http://localhost:8080", 
            "http://localhost:8090",
            "https://ecommerce.schiavon.dev",
            "https://adm.ecommerce.schiavon.dev",
            "https://server-mp.schiavon.dev"
        ]
    }))
// Forma de Ler JSON -> Pelas Midddlewares
    app.use(express.urlencoded({ extended: true }))
    app.use(express.json());

    // Rota inicial /endpoint
    app.get('/', (req, res) => {
        res.json({ message: 'Welcome Backend Ecommerce' });
    });

    // Rotas
    const adm_Routes = require("./routes/AdmRouter")
    const user_Routes = require("./routes/UserRoutes")
    const product_Routes = require("./routes/ProductRoutes")
    const order_Routes = require("./routes/OrderRoutes")
    const orderItem_Routes = require("./routes/OrderItemRoutes")
    const orderShippingRoutes = require("./routes/OrderShippingRoutes")
    const reviews_Routes = require("./routes/ReviewsRoutes")
    const category_Routes = require("./routes/CategoryRoutes")
    const shippingMethod_Routes = require("./routes/ShippingMethodRoutes")
    const tag_Routes = require("./routes/TagRoutes")
    const ProductImage_Routes = require("./routes/ProductImageRoutes")
    const attribute_Routes = require("./routes/AttributeRoutes")
    const productAttribute_Routes = require("./routes/ProductAttributeRoutes")
    const Payment_Routes = require("./routes/PaymentRoutes")
    const Imagen_Routes = require("./routes/ImagenRoutes")
    const Address_Routes = require("./routes/AddressRoutes")
    const relation = require("./routes/RelationRoutes")
    const sendEmail = require("./routes/EmailRoutes")
    const password = require("./routes/PasswordRoutes")
    const API_MelherEnvio_Routes = require("./routes/APIMelherEnvioRoutes")

    app.use('/uploads',  express.static('uploads'));

    app.use("/api/adm", adm_Routes)
    app.use("/api/users", user_Routes)
    app.use("/api/user/address", Address_Routes)
    app.use("/api/product", product_Routes)
    app.use("/api/order", order_Routes)
    app.use("/api/orderItem", orderItem_Routes)
    app.use("/api/orderShipping", orderShippingRoutes)
    app.use("/api/category", category_Routes)
    app.use("/api/reviews", reviews_Routes)
    app.use("/api/shippingMethod", shippingMethod_Routes)
    app.use("/api/tag", tag_Routes)
    app.use("/api/productImage", ProductImage_Routes)
    app.use("/api/attribute", attribute_Routes)
    app.use("/api/productAttribute", productAttribute_Routes)
    app.use("/api/payment", Payment_Routes)
    app.use("/api/image", Imagen_Routes)
    app.use("/api/relation", relation);
    app.use("/api/send", sendEmail);
    app.use("/api/password", password);
    app.use("/api/melhorenvio", API_MelherEnvio_Routes);


    if( process.env.NODE_ENV == "production") {
        // Caso Esteja no Servidor
        const hostname = '161.35.230.172';
        const port = 4000;
        
        app.listen(port, hostname, () => {
            console.log(`Server running at https://${hostname}:${port}/`);
        });
    } else {
        // Caso Esteja no ambiente de Desenvolvimento
        const port = 4000;

       app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}/`);
    });
}
