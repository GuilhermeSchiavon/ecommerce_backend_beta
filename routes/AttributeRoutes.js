const { Sequelize } = require('sequelize');
const router = require('express').Router();
const Attribute = require("../models/Attribute")
const Product = require("../models/Product")
const Image = require("../models/Image")
const { protectADM } = require('../middleware/authMiddleware')

    router.post('/', protectADM, async (req, res) => {
        const { ...data }  = req.body;
        try {
            const existingAttribute = await Attribute.findOne({ where: { name: data.name }});
            if (existingAttribute) {return res.status(500).json({ message: 'Já existe um Attributo com este nome.' })}
        
            const newAttribute = await Attribute.create(data);
            
            res.status(201).json({ 
                message: "Atributo criado com sucesso!", 
                item: newAttribute
            });
        } catch (error) {
            return res.status(500).json({ 
                message: "Falha ao criar o Attributo!", 
                error: error.message 
            });
        }
    });

	router.get("/", protectADM, async (req, res) => {
		try {
			const keyword = req.query.keyword || "";
			const pageNumber = Number(req.query.pageNumber) || 1;
			const pageSize = 12;
			const offset = (pageNumber - 1) * pageSize;

			const { count, rows: itens } = await Attribute.findAndCountAll({
                where: {
                    [Sequelize.Op.or]: [
                        Sequelize.literal(`name LIKE '%${keyword}%'`),
                        Sequelize.literal(`status LIKE '%${keyword}%'`),
                    ]
                },
				limit: pageSize,
				offset
			});

			res.status(200).json({
				itens,
				pageNumber,
				pages: Math.ceil(count / pageSize),
				total: count
			})
		} catch (error) {
            return res.status(500).json({ 
                message: "Falha ao carregar os Atributos!", 
                error: error.message 
            });
		}
	});

	router.get('/:id', protectADM, async (req, res) => {
		const id = req.params.id;
		try {
		  const existingAttribute = await Attribute.findByPk(id, {
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
	  
		  res.status(200).json({item: existingAttribute });
		} catch (error) {
            return res.status(500).json({ 
                message: "Falha ao carregar o Atributo!", 
                error: error.message 
            });
		}
	})

	router.put("/:id", protectADM, async (req, res) => {
        const id = req.params.id;
        const data = req.body;
        try {
          const existingAttribute = await Attribute.findByPk(id);
      
          if (!existingAttribute) {
            return res.status(404).json({ 
                message: 'Atributo não encontrado',
                error: error.message 
            });
          }
      
          await existingAttribute.update(data);

          res.status(200).json({existingAttribute, message: "Attribute Atualizado"});
        } catch (error) {
            return res.status(500).json({ 
                message: "Falha ao atualizar o Atributo!", 
                error: error.message 
            });
        }
	});

	router.delete('/:id', protectADM, async (req, res) => {
        const id = req.params.id;
        try {
            const existingAttribute = await Attribute.findByPk(id);
    
            if (!existingAttribute) {
                return res.status(404).json({ 
                    message: 'Atributo não encontrado',
                    error: error.message 
                });
            }
            const transaction = await Attribute.sequelize.transaction();

            await existingAttribute.destroy({ transaction });
    
            await transaction.commit();
    
            res.status(200).json({ message: "Atributo excluído com sucesso!" });
        } catch (error) {
            await transaction.rollback();
            return res.status(500).json({ 
                message: "Falha ao excluir o Atributo!", 
                error: error.message 
            });
        }
	})
  
 module.exports = router