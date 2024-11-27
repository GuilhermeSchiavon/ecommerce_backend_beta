// Importação para gerar a Rotas do Usuário
const router = require('express').Router();
const User = require("../models/User")
const UserAddress = require("../models/UserAddress")
const Order = require("../models/Order")
const { protect } = require('../middleware/authMiddleware')


    router.get('/', protect, async (req, res) => {
        try {
            const user = await User.findByPk(req.userId);

            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }
        
            const address = await UserAddress.findAndCountAll({ 
                where: { UserId: req.userId },
                order: [
                    ['id', 'DESC']
                ]
            });

            return res.status(200).json({ address });

        } catch (error) {
            return res.status(500).json({ message: error.message, error });
        }
    });

    router.post('/add', protect, async (req, res) => {
        const { street, number, complement, zip, neighborhood, city, state, country } = req.body;
        try {
            const user = await User.findByPk(req.userId);

            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            const existingAddress = await UserAddress.findOne({ 
                where: { UserId: req.userId },
                order: [['default', 'DESC']]
            });
            
            if (existingAddress) {
                await existingAddress.update({ default: false });
            }
    
            const address = await UserAddress.create({ street, number, complement, zip, neighborhood, city, state, country, default: true, UserId: user.id });
            
            return res.status(200).json(address);

        } catch (error) {
            return res.status(500).json({ message: error.message, error });
        }
    });    
  
    router.put('/update', protect, async (req, res) => {
        const { id, street, number, complement, zip, neighborhood, city, state, country } = req.body;
        try {
            const user = await User.findByPk(req.userId);
    
            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }
    
            // Encontra o endereço que o usuário está tentando atualizar
            const addressToUpdate = await UserAddress.findOne({ where: { id: id, UserId: req.userId } });
    
            if (!addressToUpdate) {
                return res.status(404).json({ message: 'Endereço não encontrado' });
            }

            // Caso esse endereço não seja o Padrão então
            if(!addressToUpdate.default) {
                // Desativa o "default" dos outros endereços do usuário
                await UserAddress.update({ default: false }, { where: { UserId: req.userId } });
            }
    
    
            // Define o endereço como "default" e atualiza seus dados
            await addressToUpdate.update({ street, number, complement, zip, neighborhood, city, state, country, default: true });
    
            return res.status(200).json({ message: 'Endereço atualizado com sucesso' });
        } catch (error) {
            return res.status(500).json({ message: error.message, error });
        }
    });

    router.delete('/delete/:id', protect, async (req, res) => {
        try {
            const user = await User.findByPk(req.userId);
            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }
    
            const address = await UserAddress.findByPk(req.params.id);
            if (!address || address.UserId  !== user.id) {
                return res.status(404).json({ message: 'Endereço não encontrado' });
            }

            const associatedOrders = await Order.findAll({ where: { UserAddressId: address.id } });
            // const associatedOrders = await Order.findAll({ where: { UserAddressId: address.id, orderStatus: ['pendente', 'aguardando', 'enviado']  } });
            if (associatedOrders.length > 0) {
                return res.status(400).json({ message: 'Este endereço não pode ser deletado, pois existem pedidos vinculados' });
            }
            // Verifica se o endereço que está sendo deletado é o padrão
            if (address.default) {
                const defaultAddress = await UserAddress.findOne({ where: { UserId: req.userId, default: false } });
                if (defaultAddress) {
                // Se existir outro endereço, torna ele o padrão
                await defaultAddress.update({ default: true });
                }
            }
        
            // Deleta o endereço
            await address.destroy();
        
            return res.status(200).json({ message: 'Endereço deletado com sucesso' });
        } catch (error) {
            res.status(500).json({ message: error })
        }
      });
 module.exports = router