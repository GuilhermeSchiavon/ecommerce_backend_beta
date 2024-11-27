// Importação para gerar a Rotas do Usuário
const router = require('express').Router();
const Product = require("../models/Product")
const Reviews = require("../models/Review")
const { protect } = require('../middleware/authMiddleware')

    // Criar
    router.post('/add/:ProductId', protect, async (req, res) => {
        try {
            const UserId = req.userId
            const { ProductId } = req.params;
            const { comment, rating } = req.body;
            const product = await Product.findByPk(ProductId);
            if (!product) {
                return res.status(404).json({message:  'Produto não encontrado' });
            }
        
            const existingReview = await Reviews.findOne({
                where: {
                ProductId,
                UserId
                }
            });
            if (existingReview) {
                return res.status(400).json({ message: 'Você já avaliou esse produto' });
            }
            
            const review = await Reviews.create({
                comment,
                rating,
                ProductId,
                UserId
            });
        
            return res.status(201).json(review);
        } catch (error) {
        console.error('Erro ao adicionar avaliação:', error);
        return res.status(500).json({ emessagerror: 'Erro ao adicionar avaliação' });
        }
    })

    // Deletar 
    router.delete('/del/:ProductId/reviews/:reviewId', protect, async (req, res) => {
        try {
            const { ProductId, reviewId } = req.params;
            const product = await Product.findByPk(ProductId);
            if (!product) {
              return res.status(404).json({ message: 'Produto não encontrado' });
            }
        
            const review = await Reviews.findOne({
              where: {
                id: reviewId,
                ProductId
              }
            });
            if (!review) {
              return res.status(404).json({ message: 'Avaliação não encontrada' });
            }
        
            await review.destroy();
        
            return res.status(200).json({ message: 'Avaliação removida com sucesso' });
          } catch (error) {
            console.error('Erro ao deletar avaliação:', error);
            return res.status(500).json({ message: 'Erro ao deletar avaliação' });
          } 
    })
    
    // Listar
    // router.get('/', async (req, res) => {
    //     try {
    //         const Reviews = await Review.findAll();
    //         res.status(200).json({ data: users  });
    //     } catch (error) {
    //         return res.status(500).json({ message: error.message, error });  
    //     }
    // })
    
    // Buscar expecifico por ID
    // router.get('/:id', async (req, res) => {

    // })
    
    // Update  - (PATCH -> Atualizar parte do objeto, exemplo somente um campo )
    // router.patch('/:id', async (req, res) => {
    
    // })
  
 module.exports = router
