const router = require('express').Router();
const { Sequelize } = require('sequelize');
const Payment = require("../models/Payment")
const User = require("../models/User")
const Order = require('../models/Order');
const { protect, protectADM } = require('../middleware/authMiddleware')

    router.post('/', protectADM, async (req, res) => {
      // try {
        const data = req.body;
        if(data.transaction_id) {
          const existingPayment = await Payment.findOne({ where: { transaction_id: data.transaction_id }});
          if (existingPayment) {return res.status(500).json({ message: 'Já existe uma Pagamento com esta Cahve de transação.' })}
        }

        const newPayment = await Payment.create({...data, AdmId: req.userId});

        return res.status(201).json({ message: "Pagamento criado com sucesso!", item: newPayment });
      // } catch (error) {
      //   return res.status(500).json({ message: 'Erro ao gravar o pagamento', error});
      // }
    })
    // Gravar pagamento via Credito
    router.post('/add/credit', protect, async (req, res) => {
      try {
            const { OrderId, ...paymentData } = req.body.orderPayment;
            const { id, status } = req.body.statusPayment;
            const CuponId = req.body.CuponId;

            const existingOrder = await Order.findByPk(OrderId);
            if (!existingOrder) {return res.status(500).json({ error: 'Order não encontrada.' })}
        
            const payment = await Payment.create({
              transaction_id: id,
              status,
              ...paymentData,
              UserId: req.userId,
              OrderId: existingOrder.id,
              CuponId
            });
        
            return res.status(201).json(payment);

        } catch (error) {
          return res.status(500).json({ message: 'Erro ao gravar o pagamento', error });

        }
    })
    
    // Gravar pagamento via Pix
    router.post('/add/pix', protect, async (req, res) => {
      try {
            const { OrderId, CuponId, ...paymentData } = req.body;
            const existingOrder = await Order.findByPk(OrderId);
            if (!existingOrder) {return res.status(500).json({ error: 'Order não encontrada.' })}

            const payment = await Payment.create({
              ...paymentData,
              UserId: req.userId,
              OrderId: existingOrder.id,
              CuponId
            });
            return res.status(201).json(payment);
        } catch (error) {          
          return res.status(500).json({ message: 'Erro ao gravar o pagamento', error });
        }
    })
    
    router.get("/", protectADM, async (req, res) => {
      try {
        const keyword = req.query.keyword || "";
        const pageNumber = Number(req.query.pageNumber) || 1;
        const pageSize = 12;
        const offset = (pageNumber - 1) * pageSize;
  
        const { count, rows: payments } = await Payment.findAndCountAll({
          where: {
            [Sequelize.Op.or]: [
                {
                  id: {
                    [Sequelize.Op.like]: `%${keyword}%`
                  },
                },
                {
                  transaction_id: {
                    [Sequelize.Op.like]: `%${keyword}%`
                  },
                },
                {
                  external_reference: {
                    [Sequelize.Op.like]: `%${keyword}%`
                  },
                },
                {
                  status: {
                    [Sequelize.Op.like]: `%${keyword}%`
                  },
                }
            ]
          },
          include: [
              { 
                model: User,
                attributes:{
                  exclude: ['password', 'token']
                }
              },
              { model: Order,
              }
          ],
          limit: pageSize,
          offset,
            order: [
              ['id', 'DESC']
            ]
        });
              const total = await Payment.count({
                  where: {
                      [Sequelize.Op.or]: [
                          {
                              id: {
                                  [Sequelize.Op.like]: `%${keyword}%`,
                              },
                          },
                          {
                              transaction_id: {
                                  [Sequelize.Op.like]: `%${keyword}%`,
                              },
                          },
                          {
                              external_reference: {
                                  [Sequelize.Op.like]: `%${keyword}%`,
                              },
                          },
                          {
                              status: {
                                  [Sequelize.Op.like]: `%${keyword}%`,
                              },
                          }                         
                      ]
                  },
              });
  
        res.status(200).json({
          payments,
          pageNumber,
          pages: Math.ceil(total / pageSize),
          total
        })
      } catch (error) {
        res.status(500).json({message: error.message})
      }
    });
  
    router.get("/:id", protectADM, async (req, res) => {
      const id = req.params.id;
      try {
        const payment = await Payment.findByPk(id, {
          include: [
            { 
              model: User,
              attributes:{
                exclude: ['password', 'token']
              }
            },
            { model: Order }
          ],
        });
    
        res.status(200).json(payment);
      } catch (error) {
        return res.status(500).json({ message: error.message, error });
      }
    });

    router.put("/:id", protectADM, async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
    
      try {
        const payment = await Payment.findByPk(id);
    
        if (!payment) {
          return res.status(404).json({ message: 'Pagamento não encontrada' });
        }
    
        await payment.update(updatedData);
    
        res.status(200).json({payment, message: "Pagamento Atualizado"});
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });
    
 module.exports = router
