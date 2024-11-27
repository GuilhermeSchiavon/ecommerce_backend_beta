const router = require('express').Router();
const axios = require('axios');
const cors = require('cors');
const { protect, protectADM } = require('../middleware/authMiddleware')

    router.post('/shipment/calculate', async (req, res) => {
        try {
            const params = { ...req.body };
            params.products.forEach(product => {
                product.insurance_value = (parseFloat(product.insurance_value) * (parseFloat(process.env.MELHOR_ENVIO_SECURE_PERCENTAGE) / 100)).toFixed(2);
            });
            params.from = { postal_code: process.env.MELHOR_ENVIO_POSTAL_CODE };
            const response = await axios.post(`${process.env.MELHOR_ENVIO_URL}/api/v2/me/shipment/calculate`, params, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
                    'User-Agent': `Aplicação ${process.env.MELHOR_ENVIO_EMAIL}`
                }
            });
            res.status(201).json(response.data);
        } catch (error) {
            return res.status(500).json({ 
                message: error.response.data.message || error.response.data.error || "Falha ao calcular o frete!",
                error: error.response.data,
                errors: error.response.data.errors
            });
        }
    });

    router.get('/cart/:idShipping', async (req, res) => {
        const idShipping = req.params.idShipping;
        try {
            const response = await axios.get(`${process.env.MELHOR_ENVIO_URL}/api/v2/me/orders/${idShipping}`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
                    'User-Agent': `Aplicação ${process.env.MELHOR_ENVIO_EMAIL}`
                }
            });
            res.status(201).json(response.data);
        } catch (error) {
            return res.status(500).json({ 
                message: "Falha ao buscar pela Etiqueta!", 
                error: error
            });
        }
    });

    router.post('/cart', async (req, res) => {
        try {
            const data = { 
                from: {
                    "name": process.env.MELHOR_ENVIO_NAME,
                    "phone": process.env.MELHOR_ENVIO_PHONE,
                    "email": process.env.MELHOR_ENVIO_EMAIL,
                    "document": process.env.MELHOR_ENVIO_DOCUMENT,
                    "company_document": process.env.MELHOR_ENVIO_COMPANY_DOCUMENT,
                    "state_register": process.env.MELHOR_ENVIO_STATE_REGISTER,
                    "address": process.env.MELHOR_ENVIO_ADDRESS,
                    "complement": process.env.MELHOR_ENVIO_COMPLEMENT,
                    "number": process.env.MELHOR_ENVIO_NUMBER,
                    "district": process.env.MELHOR_ENVIO_DISTRICT,
                    "city": process.env.MELHOR_ENVIO_CITY,
                    "country_id": process.env.MELHOR_ENVIO_COUNTRY_ID,
                    "postal_code": process.env.MELHOR_ENVIO_POSTAL_CODE,
                    "state_abbr": process.env.MELHOR_ENVIO_STATE_ABBR,
                    "note": process.env.MELHOR_ENVIO_NOTE
                }, 
                ...req.body[0]
            };
            const response = await axios.post(`${process.env.MELHOR_ENVIO_URL}/api/v2/me/cart`, data, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
                    'User-Agent': `Aplicação ${process.env.MELHOR_ENVIO_EMAIL}`
                }
            });
            res.status(201).json(response.data);
        } catch (error) {
            return res.status(500).json({ 
                message: error.response.data.message || error.response.data.error || "Falha ao adicionar ao Carrinho de Compras Melhor Envio!",
                error: error.response.data,
                errors: error.response.data.errors
            });
        }
    });

    router.post('/shipment/checkout', async (req, res) => {
        const data = req.body;
        try {
            const response = await axios.post(`${process.env.MELHOR_ENVIO_URL}/api/v2/me/shipment/checkout`, data, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
                    'User-Agent': `Aplicação ${process.env.MELHOR_ENVIO_EMAIL}`
                }
            });
            res.status(201).json(response.data);
        } catch (error) {
            return res.status(500).json({ 
                message: error.response.data.message || "Falha ao realiaxar o pagamento no Melhor Envio!",
                error: error.response.data,
                errors: error.response.data.errors
            });
        }
    });

    router.post('/shipment/generate', async (req, res) => {
        const orders = req.body;
        try {
            const response = await axios.post(`${process.env.MELHOR_ENVIO_URL}/api/v2/me/shipment/generate`, orders, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
                    'User-Agent': `Aplicação ${process.env.MELHOR_ENVIO_EMAIL}`
                }
            });
            res.status(201).json(response.data);
        } catch (error) {
            return res.status(500).json({ 
                message: error.response.data.message || "Falha ao gerar a etiqueta no Melhor Envio!",
                error: error.response.data,
                errors: error.response.data.errors
            });
        }
    });

    router.post('/shipment/print', async (req, res) => {
        const orders = req.body;
        try {
            const response = await axios.post(`${process.env.MELHOR_ENVIO_URL}/api/v2/me/shipment/print`, orders, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
                    'User-Agent': `Aplicação ${process.env.MELHOR_ENVIO_EMAIL}`
                }
            });
            res.status(201).json(response.data);
        } catch (error) {
            return res.status(500).json({ 
                message: error.response.data.message || "FalFalha ao gerar a impressaão no Melhor Envio!",
                error: error.response.data,
                errors: error.response.data.errors
            });
        }
    });

 module.exports = router