const { Sequelize } = require('sequelize');
const router = require('express').Router();
const Category = require("../models/Category")
const Product = require("../models/Product")
const Image = require("../models/Image")
const ProductCategory = require("../models/ProductCategory")
const { protectADM } = require('../middleware/authMiddleware')

	router.post('/', protectADM, async (req, res) => {
		const { name, description, parentId }  = req.body;
		try {
			const existingCategory = await Category.findOne({ where: { name } });
            if (existingCategory) {return res.status(500).json({ message: 'Já existe uma Categoria com este Nome.' })}
        
			const category = await Category.create({
				name,
				description,
				parentId,
				status: 'ativo'
			});
		  
            res.status(201).json({ message: "Categoria criada com sucesso!", category });
        } catch (error) {
          return res.status(500).json({ message: "Falha ao criar Categoria!", error: error.message });
        }
	});

	router.get("/", async (req, res) => {
		try {
			const keyword = req.query.keyword || "";
			const pageNumber = Number(req.query.pageNumber) || 1;
			const pageSize = 12;
			const offset = (pageNumber - 1) * pageSize;

			const { count, rows: categories } = await Category.findAndCountAll({
				where: {
					name: {
							[Sequelize.Op.like]: `%${keyword}%`,
					},
				},
				limit: pageSize,
				offset
			});

			res.status(200).json({
				categories,
				pageNumber,
				pages: Math.ceil(count / pageSize),
				total: count
			})
		} catch (error) {
			res.status(500).json({message: error.message})
		}
	});

	router.get("/suggestions", async (req, res) => {
		try {
			const limit = Number(req.query.limit) || 8;
		
			// Certifique-se de que a coluna `order` está sendo tratada corretamente
			const categories = await Category.findAll({
			  where: {
				status: 'ativo',
			  },
			  limit,
			  order: [
				[Sequelize.literal('ISNULL(`order`), `order` ASC')]  // Ordena os nulos por último
			  ]
			});

			res.status(200).json({
				categories
			})
		} catch (error) {
			res.status(500).json({message: error.message})
		}
	});

	router.get('/:id', protectADM, async (req, res) => {
		const id = req.params.id;
		try {
		  const category = await Category.findByPk(id, {
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
	  
		  res.status(200).json(category);
		} catch (error) {
			return res.status(500).json({ message: error.message, error });
		}
	})

	router.put("/:id", protectADM, async (req, res) => {
        const id = req.params.id;
        const updatedData = req.body;
		
        try {
          const category = await Category.findByPk(id);
      
          if (!category) {
            return res.status(404).json({ message: 'Categoria não encontrada' });
          }
      
          await category.update(updatedData);

          res.status(200).json({category, message: "Categoria Atualizado"});
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
	});

	router.delete('/:id', protectADM, async (req, res) => {
		const id = req.params.id;
        try {
            const existingCategory = await Category.findByPk(id);
    
            if (!existingCategory) {
                return res.status(404).json({ 
                    message: 'Categoria não encontrado',
                    error: error.message 
                });
            }
            const transaction = await Category.sequelize.transaction();

            await existingCategory.destroy({ transaction });
    
            await transaction.commit();
    
            res.status(200).json({ message: "Categoria excluída com sucesso!" });
        } catch (error) {
            await transaction.rollback();
            return res.status(500).json({ 
                message: "Falha ao excluir a Categoria!", 
                error: error.message 
            });
        }
	})
  
 module.exports = router
