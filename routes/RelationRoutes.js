const { Sequelize } = require('sequelize');
const router = require('express').Router();
const Relation = require("../models/Relation");
const Product = require("../models/Product");
const Image = require("../models/Image");
const ProductRelation = require("../models/ProductRelation");
const { protectADM } = require('../middleware/authMiddleware');

    // Criar
    router.post('/', protectADM, async (req, res) => {
		const { description, Products }  = req.body;
		try {
			const existingRelation = await Relation.findOne({ where: { description } });
			if (existingRelation) {return res.status(500).json({ message: 'Já existe uma Relação com este Descrição.' })}
			
			const newRelation = await Relation.create({
				description,
				status: 'ativo',
			});
			const productIds = Products.map(product => product.id);

			if (productIds && productIds.length > 0) {
				await newRelation.addProducts(productIds);
			}
			
			return res.status(201).json({ message: 'Relação criada com sucesso!', relation: newRelation });
		} catch (error) {
			return res.status(500).json({ message: "Falha ao criar Relation!", error: error.message });
		}
    });
    // Listar
    router.get('/', protectADM, async (req, res) => {
        try {
            const keyword = req.query.keyword || "";
            const pageNumber = Number(req.query.pageNumber) || 1;
            const pageSize = 12;
            const offset = (pageNumber - 1) * pageSize;

            const itens = await Relation.findAll({
                where: {
                    description: {
                        [Sequelize.Op.like]: `%${keyword}%`,
                    }
                },
                limit: pageSize,
                offset,
                order: [['id', 'DESC']],
                include: [
                      {
                          model: Product,
                          include: [
                              {
                                  model: Image,
                                  order: [['id', 'ASC']]
                              }
                          ]
                      }
                  ]
            });

            const count = await Relation.count({
              where: {
                  description: {
                      [Sequelize.Op.like]: `%${keyword}%`,
                  },
              },
            });
            res.status(200).json({
                itens,
                pageNumber,
                pages: Math.ceil(count / pageSize),
                total: count
            });
        } catch (error) {
  			    return res.status(500).json({ message: error.message, error });
        }
    })

	router.get('/:id', protectADM, async (req, res) => {
		const id = req.params.id;
		try {
		  const existingRelation = await Relation.findByPk(id, {
			include: [
			  { 
				model: Product,
				include: [
					{ 
					  model: Image,
					},
				],
			  },
			],
		  });
	  
		  res.status(200).json(existingRelation);
		} catch (error) {
		  res.status(500).json({ message: error.message });
		}
	})

	router.put("/:id", protectADM, async (req, res) => {
        const id = req.params.id;
        const updatedData = req.body;
        try {
          const existingRelation = await Relation.findByPk(id);
      
          if (!existingRelation) {
            return res.status(404).json({ message: 'Relação não encontrada' });
          }
      
          await existingRelation.update(updatedData);

          res.status(200).json({existingRelation, message: "Relação Atualizada"});
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
	});

  router.delete('/:id', protectADM, async (req, res) => {
    const id = req.params.id;
    try {
        const existingRelation = await Relation.findByPk(id);

        if (!existingRelation) {
            return res.status(404).json({ 
                message: 'Relação não encontrada',
                error: error.message 
            });
        }
        const transaction = await Relation.sequelize.transaction();

        await existingRelation.destroy({ transaction });

        await transaction.commit();

        res.status(200).json({ message: "Relação excluída com sucesso!" });
    } catch (error) {
        await transaction.rollback();
        return res.status(500).json({ 
            message: "Falha ao excluir a Relação!", 
            error: error.message 
        });
    }
  })
  
 module.exports = router
