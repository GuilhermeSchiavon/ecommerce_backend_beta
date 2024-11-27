const { Sequelize } = require('sequelize');
const router = require('express').Router();
const Order = require("../models/Order")
const OrderShipping = require("../models/OrderShipping")
const { protect, protectADM } = require('../middleware/authMiddleware')

    router.post('/', protectADM, async (req, res) => {
        const { transactions, orders, OrderId }  = req.body;
        try {
            const existingOrderShipping = await OrderShipping.findOne({ where: { order_id: orders.id }});
                if (existingOrderShipping) {return res.status(500).json({ message: 'Já existe uma OrderShipping com este nome.' })}
            
            const item = await OrderShipping.create({
                order_id: orders.id,
                order_protocol: orders.protocol,
                transaction_id: transactions.id,
                transaction_protocol: transactions.protocol,
                service_id: orders.service.id,
                price: orders.price,
                delivery_min: orders.delivery_min,
                delivery_max: orders.delivery_max,
                status: transactions.status || 'pending',
                OrderId
            });

            res.status(201).json({ item, message: 'Etiqueta criada com sucesso'});
        } catch (error) {
            return res.status(500).json({ 
                message: "Falha ao criar a Etiqueta!", 
                error: error.message 
            });
        }
    });

	// router.get("/", protectADM, async (req, res) => {
	// 	try {
	// 		const keyword = req.query.keyword || "";
	// 		const pageNumber = Number(req.query.pageNumber) || 1;
	// 		const pageSize = 12;
	// 		const offset = (pageNumber - 1) * pageSize;

	// 		const { count, rows: itens } = await OrderShipping.findAndCountAll({
    //             where: {
    //                 [Sequelize.Op.or]: [
    //                     Sequelize.literal(`name LIKE '%${keyword}%'`),
    //                     Sequelize.literal(`status LIKE '%${keyword}%'`),
    //                 ]
    //             },
	// 			limit: pageSize,
	// 			offset
	// 		});

	// 		res.status(200).json({
	// 			itens,
	// 			pageNumber,
	// 			pages: Math.ceil(count / pageSize),
	// 			total: count
	// 		})
	// 	} catch (error) {
    //         return res.status(500).json({ 
    //             message: "Falha ao carregar as OrderShippings!", 
    //             error: error.message 
    //         });
	// 	}
	// });

	// router.get('/:id', protectADM, async (req, res) => {
	// 	const id = req.params.id;
	// 	try {
	// 	  const existingOrderShipping = await OrderShipping.findByPk(id, {
	// 		include: [
	// 		  { 
	// 			model: Order,
	// 		  },
	// 		],
	// 	  });
	  
	// 	  res.status(200).json({item: existingOrderShipping });
	// 	} catch (error) {
    //         return res.status(500).json({ 
    //             message: "Falha ao carregar a OrderShipping!", 
    //             error: error.message 
    //         });
	// 	}
	// })

	router.put("/:id", protectADM, async (req, res) => {
        const id = req.params.id;
        const data = req.body;

        try {
          const existingOrderShipping = await OrderShipping.findByPk(id);
      
          if (!existingOrderShipping) {
            return res.status(404).json({ 
                message: 'OrderShipping não encontrada',
                error: error.message 
            });
          }
      
          await existingOrderShipping.update(data);

          res.status(200).json({existingOrderShipping, message: "OrderShipping Atualizada"});
        } catch (error) {
            return res.status(500).json({ 
                message: "Falha ao atualizar a OrderShipping!", 
                error: error.message 
            });
        }
	});

	// router.delete('/:id', protectADM, async (req, res) => {
    //     const id = req.params.id;
    //     try {
    //         const existingOrderShipping = await OrderShipping.findByPk(id);
    
    //         if (!existingOrderShipping) {
    //             return res.status(404).json({ 
    //                 message: 'OrderShipping não encontrada',
    //                 error: error.message 
    //             });
    //         }
    //         const transaction = await OrderShipping.sequelize.transaction();

    //         await existingOrderShipping.destroy({ transaction });
    
    //         await transaction.commit();
    
    //         res.status(200).json({ message: "OrderShipping excluído com sucesso!" });
    //     } catch (error) {
    //         await transaction.rollback();
    //         return res.status(500).json({ 
    //             message: "Falha ao excluir a OrderShipping!", 
    //             error: error.message 
    //         });
    //     }
	// })
  
 module.exports = router