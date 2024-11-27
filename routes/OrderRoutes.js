const sequelize = require("../config/db_ecommerce")
const { Sequelize } = require('sequelize');
const router = require('express').Router();
const Order = require("../models/Order")
const OrderItem = require("../models/OrderItem")
const OrderShipping = require("../models/OrderShipping")
const Product = require("../models/Product")
const Image = require("../models/Image")
const User = require("../models/User")
const UserAddress = require("../models/UserAddress")
const ShippingMethod = require("../models/ShippingMethod")
const Payment = require("../models/Payment")
const Cupom = require("../models/Cupom")
const { protect, protectADM } = require('../middleware/authMiddleware')


    // Criar
    router.post('/add', protect, async (req, res) => {
        const { orderItems, address, shippingSelect, totalAmount } = req.body;
        const UserId = req.userId
            
        const transaction = await sequelize.transaction();
        try {
            // Crie uma transação para garantir consistência nos dados
        
            // Obtenha o endereço existente
            const existingAddress = await UserAddress.findByPk(address.id);
            if (!existingAddress) {return res.status(500).json({ error: 'Endereço não encontrado.' })}
        
            // Como os IDs podem mudar, ou o Melhor Envio pode acrecentar novos, se eu limitar aqui, sempre vou ter que manter atualizado
            // const existingShippingMethod = await ShippingMethod.findByPk(shippingSelect.id);
            // if (!existingShippingMethod) {return res.status(500).json({ error: 'Método de entrega não encontrado.' })}

            // Crie a ordem de compra
            const createdOrder = await Order.create({
                    deliveryAddress: JSON.stringify(existingAddress),
                    shippingMethod: JSON.stringify(shippingSelect),
                    totalAmount,
                    UserId,
                    UserAddressId: existingAddress.id,
                    ShippingMethodId: shippingSelect.id,
                },
                { transaction }
            );

             // Crie os itens da ordem de compra
            const createdOrderItems = await Promise.all(
                orderItems.map(async item => {
                const { qty, price, id } = item;
        
                const product = await Product.findByPk(id);
        
                if (!product) {
                    throw new Error(`Produto com o ID ${id} não encontrado.`);
                }
        
                const createdOrderItem = await OrderItem.create(
                    {
                    quantity: qty,
                    unitPrice: price,
                    OrderId: createdOrder.id,
                    ProductId: product.id
                    },
                    { transaction }
                );
        
                return createdOrderItem;
                })
            );
  
            // Commit a transação se tudo for bem-sucedido
            await transaction.commit();
        
            res.status(201).json({
            message: 'Ordem de compra registrada com sucesso!',
            order: createdOrder,
            });

        } catch (error) {
            // Rollback a transação em caso de erro
            await transaction.rollback();
            return res.status(500).json({ message: 'Ocorreu um erro ao registrar a ordem de compra.', error });
        }
    });

    router.post('/create-order-with-payment', protectADM, async (req, res) => {
        const { amount, orderStatus, User, CartItens, ...paymentData } = req.body;
    
        console.log(req.body)

        const transaction = await sequelize.transaction(); // Iniciar uma transação
    
        // try {
            const newOrder = await Order.create({
                shippingMethod: `{"id":0,"name":"RETIRADA NA LOJA","price":"0.00", "company": {"name": "Local"}, "delivery_range": { "min": 0, "max": 0}}`,
                totalAmount: amount,
                orderStatus,
                ShippingMethodId: 99,
                UserId: User.id,
            }, { transaction });
    
            // Crie os itens da ordem de compra
            const createdOrderItems = await Promise.all(
                CartItens.map(async item => {
                    const { qty, price, id } = item;

                    const product = await Product.findByPk(id);

                    if (!product) {
                        throw new Error(`Produto com o ID ${id} não encontrado.`);
                    }

                    const createdOrderItem = await OrderItem.create(
                        {
                            quantity: qty,
                            unitPrice: price,
                            OrderId: newOrder.id,
                            ProductId: product.id
                        },
                        { transaction }
                    );

                    return createdOrderItem;
                })
            );

            const newPayment = await Payment.create({
                transaction_id: paymentData.transaction_id,
                external_reference: paymentData.external_reference,
                identificationNumber: paymentData.identificationNumber,
                cardholderEmail: paymentData.cardholderEmail,
                paymentMethodId: paymentData.paymentMethodId,
                status: paymentData.status,
                description: paymentData.description,
                amount,
                installments: paymentData.installments,
                OrderId: newOrder.id,
                UserId: User.id,
                AdmId: req.userId
            }, { transaction });
    
            await transaction.commit();
            res.status(201).json({ message: 'Ordem e pagamento criados com sucesso!', order: newOrder, payment: newPayment });
        // } catch (error) {
        //     await transaction.rollback();
        //     res.status(500).json({ message: 'Erro ao criar ordem e pagamento.', error });
        // }
    });
      
    router.post('/confirm-payment/:orderId', async (req, res) => {
        try {
            const orderId = req.params.orderId;
            const order = await Order.findByPk(orderId, { include: OrderItem });
    
            if (!order) {
                return res.status(404).json({ message: 'Ordem não encontrada' });
            }
            if (order.orderStatus !== 'pendente') {
                return res.status(400).json({ message: 'A ordem já foi processada ou cancelada' });
            }
    
            // Verifique se o pagamento foi confirmado
            const payment = await Payment.findOne({ where: { orderId } });
    
            if (!payment || payment.status !== 'approved') {
                return res.status(400).json({ message: 'O pagamento ainda não foi confirmado' });
            }
    
            // Diminua a quantidade dos produtos no estoque
            for (const orderItem of order.OrderItems) {
                const productId = orderItem.ProductId;
                const quantityPurchased = orderItem.quantity;
                const product = await Product.findByPk(productId);
    
                if (!product) {
                    return res.status(404).json({ message: `Produto com ID ${productId} não encontrado` });
                }
    
                if (product.quantity < quantityPurchased) {
                    return res.status(400).json({ message: `Estoque insuficiente para o produto ${product.name}` });
                }
    
                product.quantity -= quantityPurchased;
                await product.save();
            }
    
            // Atualize o status da ordem para 'confirmado'
            order.orderStatus = 'aguardando';
            await order.save();
    
            return res.status(200).json({ message: 'Quantidade de produtos atualizada com sucesso' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao processar a solicitação' });
        }
    });    

    router.post("/", protectADM, async (req, res) => {
		try {
			const keyword = req.query.keyword || "";
			const pageNumber = Number(req.query.pageNumber) || 1;
			const pageSize = 12;
			const offset = (pageNumber - 1) * pageSize;

			const { count, rows: orders } = await Order.findAndCountAll({
				where: {
                    [Sequelize.Op.or]: [
                        {
                            id: {
                                [Sequelize.Op.like]: `%${keyword}%`,
                            },
                        },
                        {
                            orderStatus: {
                                [Sequelize.Op.like]: `%${keyword}%`,
                            },
                        },
                        {
                            deliveryAddress: {
                                [Sequelize.Op.like]: `%${keyword}%`,
                            },
                        },
                    ]
				},
                include: [
                    { 
                        model: User,
                        attributes:{
                            exclude: ['password', 'token']
                          }
                    },
                    { 
                        model: OrderItem,
                        include: {
                            model: Product,
                            include: Image
                        },
                    }
                ],
				limit: pageSize,
				offset,
                order: [
                    ['id', 'DESC']
                ]
			});
            const total = await Order.count({
                where: {
                    [Sequelize.Op.or]: [
                        {
                            id: {
                                [Sequelize.Op.like]: `%${keyword}%`,
                            },
                        },
                        {
                            orderStatus: {
                                [Sequelize.Op.like]: `%${keyword}%`,
                            },
                        },
                        {
                            deliveryAddress: {
                                [Sequelize.Op.like]: `%${keyword}%`,
                            },
                        },
                    ]
                },
            });

			res.status(200).json({
				orders,
				pageNumber,
				pages: Math.ceil(total / pageSize),
				total
			})
		} catch (error) {
			res.status(500).json({message: error.message})
		}
	});

    router.get("/total-pendentes", protectADM, async (req, res) => {
        try {
            const pendingLogsCount = await Order.count({
              where: {
                orderStatus: {
                    [Sequelize.Op.in]: ['aguardando'],
                  },
              },
            });
        
            res.status(200).json({
              pendingLogsCount,
            });
          } catch (error) {
            return res.status(500).json({ message: error.message, error });
          }
    });


    router.post("/getTotal", protect, async (req, res) => {
        try {
            const cart = req.body.products
            const cupom = req.body.cupom || null;
            const productIds = cart.map(item => item.id);
            let cupomExistente
            
            if(cupom){
                cupomExistente = await Cupom.findOne({ 
                    where: { cuponCode: cupom.cuponCode, status: 'ativa' } 
                });

                if (cupomExistente) {
                    if (cupomExistente.typeDiscount === 'porcentagem') {
                        cupomDiscount = cupomExistente.discount / 100;
                    } else if (cupomExistente.typeDiscount === 'valor') {
                        cupomDiscount = cupomExistente.discount;
                    }
                }
            }

            const products = await Product.findAll({
                where: {
                    id: productIds
                }
            });
    
            const totalProducts = products.reduce((accumulator, product) => {
                const priceWithDiscount = product.price * (1 - product.discount / 100);
                return accumulator + (priceWithDiscount * cart.find(item => item.id === product.id).qty);
            }, 0);
    
            
            let total = totalProducts;
            
            if (cupomExistente) {
                if (cupomExistente.typeDiscount === 'porcentagem') {
                    total =  totalProducts * (1 - cupomExistente.discount / 100);
                } else if (cupomExistente.typeDiscount === 'valor') {
                    total = totalProducts - cupomExistente.discount;
                }
            }

            res.status(200).json({ total: total });
        } catch (error) {
            res.status(500).json({ 
                message: "Não foi possível calcular o total do Carrinho",
                error: error.message
             });
        }
    });

    router.get('/myorders', protect, async (req, res) => {
        const UserId = req.userId
      
        try {
          const orders = await Order.findAll({
            where: { UserId },
            include: [
                {
                    model: OrderItem,
                    include: {
                        model: Product,
                        include: Image, // Inclui a imagem associada ao produto
                    },
                },
                { 
                    model: OrderShipping
                }
            ],
            order: [
                ['id', 'DESC']
            ]
          });
      
          res.status(200).json(orders);
        } catch (error) {
            return res.status(500).json({ message: error.message, error });
        }
    });

    router.get("/:id", protectADM, async (req, res) => {
        const id = req.params.id;
        try {
          const orders = await Order.findByPk(id, {
            include: [
                { 
                    model: User,
                    attributes:{
                        exclude: ['password', 'token']
                    }
                },
                { model: ShippingMethod },
                { model: Payment },
                { model: OrderShipping },
                { model: OrderItem,
                    include: {
                        model: Product,
                        include: Image, 
                    }
                }
            ]
          });
      
          res.status(200).json(orders);
        } catch (error) {            
            return res.status(500).json({ message: error.message, error });
        }
      });
    
    // Update  - (PATCH -> Atualizar parte do objeto, exemplo somente um campo )
    router.put("/:id", protectADM, async (req, res) => {
        const id = req.params.id;
        const updatedData = req.body; // Dados a serem atualizados na ordem
      
        try {
          const order = await Order.findByPk(id);
      
          if (!order) {
            return res.status(404).json({ message: 'Ordem não encontrada' });
          }
      
          await order.update(updatedData);
      
          res.status(200).json({order, message: "Ordem de Compra Atualizado"});
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      });
      

  
 module.exports = router