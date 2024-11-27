const { Sequelize } = require('sequelize');
const router = require('express').Router();
const Tag = require("../models/Tag")
const Product = require("../models/Product")
const ProductTag = require("../models/ProductTag")
const Image = require("../models/Image")
const { protectADM } = require('../middleware/authMiddleware')

  router.post('/', protectADM, async (req, res) => {
    const { name, description }  = req.body;
    try {
      const existingTag = await Tag.findOne({ where: { name } });
      if (existingTag) {return res.status(500).json({ message: 'Já existe uma Tag com este Nome.' })}
        
      const tag = await Tag.create({
        name,
        description,
        status: 'ativo'
      });
          res.status(201).json({ message: "Tag criada com sucesso!", tag });
      } catch (error) {
        return res.status(500).json({ message: "Falha ao criar Tag!", error });
      }
  });

  router.get('/', async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const pageNumber = Number(req.query.pageNumber) || 1;
        const pageSize = 12;
        const offset = (pageNumber - 1) * pageSize;

        const { count, rows: itens } = await Tag.findAndCountAll({
            where: {
                name: {
                    [Sequelize.Op.like]: `%${keyword}%`,
                }
            },
            limit: pageSize,
            offset,
            order: [['id', 'DESC']]
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

  router.get("/suggestions", async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 4;

        const itens = await Tag.findAll({
            where: {
              status: 'ativo',
            },
            limit,
            order: [
              [Sequelize.literal('ISNULL(`order`), `order` ASC')]  // Ordena os nulos por último
            ]
        });

        res.status(200).json({
            itens
        });
    } catch (error) {
      return res.status(500).json({ message: error.message, error });
    }
  })

	router.get('/:id', protectADM, async (req, res) => {
		const id = req.params.id;
		try {
		  const tag = await Tag.findByPk(id, {
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
	  
		  res.status(200).json(tag);
		} catch (error) {
      return res.status(500).json({ message: error.message, error });
		}
	})

	router.put("/:id", protectADM, async (req, res) => {
        const id = req.params.id;
        const updatedData = req.body;
		
        try {
          const tag = await Tag.findByPk(id);
      
          if (!tag) {
            return res.status(404).json({ message: 'Tag não encontrada' });
          }
      
          await tag.update(updatedData);

          res.status(200).json({tag, message: "Tag Atualizada"});
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
	});

  router.delete('/:id', protectADM, async (req, res) => {
    const id = req.params.id;
    try {
        const existingTag = await Tag.findByPk(id);

        if (!existingTag) {
            return res.status(404).json({ 
                message: 'Tag não encontrada',
                error: error.message 
            });
        }
        const transaction = await Tag.sequelize.transaction();

        await existingTag.destroy({ transaction });

        await transaction.commit();

        res.status(200).json({ message: "Tag excluída com sucesso!" });
    } catch (error) {
        await transaction.rollback();
        return res.status(500).json({ 
            message: "Falha ao excluir a Tag!", 
            error: error.message 
        });
    }
  })
  
 module.exports = router
