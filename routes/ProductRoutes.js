// Importação para gerar a Rotas do Usuário
const router = require('express').Router();
const { Sequelize } = require('sequelize');
// Model de Pagamento
const Product = require("../models/Product")
const Category = require("../models/Category")
const ProductCategory = require("../models/ProductCategory")
const ProductTag = require("../models/ProductTag")
const Image = require("../models/Image")
const Tag = require("../models/Tag")
const Attribute = require("../models/Attribute")
const Reviews = require("../models/Review")
const User = require("../models/User")
const Variation = require("../models/Variation")
const Characteristic = require("../models/Characteristic")
const ProductCharVariation = require("../models/ProductCharVariation") //Não excluir, é onde esta a associated 
const Relation = require("../models/Relation") 
const ProductRelation = require("../models/ProductRelation");
const OrderItem = require("../models/OrderItem");
const { protect, protectADM } = require('../middleware/authMiddleware')
const fs = require('fs').promises;
const path = require('path');

    router.get("/", async (req, res) => {
      try {
            const keyword = req.query.keyword || "";
            const pageNumber = Number(req.query.pageNumber) || 1;
            const pageSize = 24;
            const offset = (pageNumber - 1) * pageSize;
            const categoryName = req.query.category;
            const tagName = req.query.tag;
            const sort = req.query.sort;

            let order = [];

            switch (sort) {
              case "Menor preço":
                order.push(['price', 'ASC']);
                break;
              case "Maior preço":
                order.push(['price', 'DESC']);
                break;
              case "Melhores avaliações":
                order.push([Sequelize.literal("avg_rating"), "DESC"]);
                break;
              default:
                break;
            }

            let categoryId = null;
            if (categoryName && categoryName !== "null" && categoryName !== "") {
              const category = await Category.findOne({ where: { name: categoryName } });
              if (category) {
                categoryId = category.id;
              } else {
                return res.status(400).json({ message: "Categoria não encontrada" });
              }
            }

            let tagId = null;
            if (tagName && tagName !== "null" && tagName !== "") {
              const tag = await Tag.findOne({ where: { name: tagName } });
              if (tag) {
                tagId = tag.id;
              } else {
                return res.status(400).json({ message: "Tag não encontrada" });
              }
            }

            const whereClause = {
              name: {
                [Sequelize.Op.like]: `%${keyword}%`,
              }
            };

            const { count, rows: products } = await Product.findAndCountAll({
                where: whereClause,
                include: [
                  { model: Image},
                  { model: Category},
                  { model: Attribute},
                  { model: Tag},
                  { 
                    model: ProductCharVariation,
                    include: [
                      { model: Characteristic },
                      { model: Variation }
                    ]
                  },
                  { 
                    model: ProductCategory,
                    where: { 
                      CategoryId: categoryId ? categoryId : { [Sequelize.Op.ne]: null }
                    },
                    required: categoryId ? true : false
                  },
                  { 
                    model: ProductTag,
                    where: { 
                      TagId: tagId ? tagId : { [Sequelize.Op.ne]: null }
                    },
                    required: tagId ? true : false
                  }
                ],
                attributes: {
                  include: [ 
                    [Sequelize.literal('(SELECT AVG(rating) FROM Reviews WHERE Reviews.ProductId = Product.id)'), "avg_rating"],
                  ]
                },
                limit: pageSize,
                offset,
                order
            });

            const total = await Product.count({
              where: whereClause,
              include:[
                { 
                  model: ProductCategory,
                  where: { 
                    CategoryId: categoryId ? categoryId : { [Sequelize.Op.ne]: null }
                  },
                  required: categoryId ? true : false
                },
                { 
                  model: ProductTag,
                  where: { 
                    TagId: tagId ? tagId : { [Sequelize.Op.ne]: null }
                  },
                  required: tagId ? true : false
                }
              ]
            });
            res.status(200).json({
                products,
                pageNumber,
                pages: Math.ceil(total / pageSize),
                total
            })
        } catch (error) {
          return res.status(500).json({ message: error.message, error });
        }
    })

    router.get("/:id", async (req, res) => {
        try {
            const id = req.params.id;
            const product = await Product.findByPk(id, {
                include: [
                  { 
                    model: Reviews, 
                    include: {
                      model: User,
                      attributes: ['firstName', 'lastName']
                    }
                  },
                  { model: Image },
                  { model: Category },
                  { model: Attribute },
                  { model: Tag },
                  { 
                    model: ProductCharVariation,
                    include: [
                      { model: Characteristic },
                      { model: Variation }
                    ]
                  },
                  { model: Relation,
                    include: [
                      { model: Product,
                        include: [
                          { model: Image }
                        ]
                      }
                    ]
                  }
                ],
                attributes: {
                  include: [
                    // média de rating dos Reviews
                    [Sequelize.literal('(SELECT AVG(rating) FROM Reviews WHERE Reviews.ProductId = Product.id)'), "avg_rating"],
                    // número de reviews do produto
                    [Sequelize.literal('(SELECT COUNT(*) FROM Reviews WHERE Reviews.ProductId = Product.id)'), "num_reviews"]
                  ]
                }
              });
    
            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }
    
            res.status(200).json( product );
        } catch (error) {
          return res.status(500).json({ message: error.message, error });
        }
    });

    router.post("/", protectADM, async (req, res) => {
      const transaction = await Product.sequelize.transaction();
      const { name, description, price, discount, brand, model, sizeGuide, weight, height, width, length, availability, status, quantity, Categories, Tags, Attributes, ProductCharVariations, Relations } = req.body.product;
        try {
            const newProduct = await Product.create({
                name,
                description,
                discount,
                price,  
                brand,
                model,
                sizeGuide,
                weight,
                height,
                width,
                length,
                width,
                availability,
                status,
                quantity,
            }, { transaction } );

            await newProduct.setCategories( Categories ? Categories.map(item => item.id) : [], { transaction } );
            await newProduct.setTags( Tags ? Tags.map(item => item.id) : [], { transaction } );
            await newProduct.setAttributes( Attributes ? Attributes.map(item => item.id) : [], { transaction } );
            await newProduct.setRelations( Relations ? Relations.map(item => item.id) : [], { transaction });
            await newProduct.setProductCharVariations( ProductCharVariations ? ProductCharVariations.map(item => item.id) : [], { transaction } );

            await transaction.commit();
         
            res.status(201).json({ message: "Produto criado com sucesso!", newProduct });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    });
 
    router.patch("/", protectADM, async (req, res) => {
      const transaction = await Product.sequelize.transaction();
      try {
        const { product } = req.body;
        const id = product.id;
        const updatedProductData = product; // Dados atualizados do produto
    
        const existingProduct = await Product.findByPk(id, { transaction });
    
        if (!existingProduct) {
          await transaction.rollback();
          return res.status(404).json({ message: "Produto não encontrado" });
        }
    
        await existingProduct.update(updatedProductData, { transaction });

        await existingProduct.setCategories( product.Categories.map(item => item.id), { transaction });
        await existingProduct.setTags( product.Tags.map(item => item.id), { transaction });
        await existingProduct.setAttributes( product.Attributes.map(item => item.id), { transaction });
        await existingProduct.setRelations( product.Relations.map(item => item.id), { transaction });

        await transaction.commit();

      return res.status(200).json({ message: 'Produto atualizado com sucesso' });
      } catch (error) {
        await transaction.rollback();
        return res.status(500).json({ message: error.message, error });
      }
    });

    router.delete("/:id", protectADM, async (req, res) => {
      const productId = req.params.id;
  
      const transaction = await Product.sequelize.transaction();
  
      try {
          const productToDelete = await Product.findByPk(productId);
  
          if (!productToDelete) {
              return res.status(404).json({ message: "Produto não encontrado." });
          }

          // Verifique se o produto está associado a pedidos pendentes
          const hasPendingOrders = await OrderItem.findOne({
              where: {
                  ProductId: productToDelete.id,
              }
          });

          if (hasPendingOrders) {
              return res.status(400).json({ message: "Não é possível excluir o produto com pedidos." });
          }

          const productImages = await productToDelete.getImages();
          for (const imageToRemove of productImages) {
              const filePath = path.join(__dirname, '../uploads/products/', imageToRemove.filename);
              await fs.unlink(filePath);
              await imageToRemove.destroy({ transaction });
          }

          await productToDelete.destroy({ transaction });
  
          await transaction.commit();
  
          res.status(200).json({ message: "Produto excluído com sucesso!" });
      } catch (error) {
          console.error(error);
          await transaction.rollback();
          res.status(500).json({ message: error.message });
      }
  });


 module.exports = router