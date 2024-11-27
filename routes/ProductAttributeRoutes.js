// Importação para gerar a Rotas do Usuário
const router = require('express').Router();

// Model de Pagamento
const User = require("../models/ProductAttribute")
    // Criar
    router.post('/add', async (req, res) => {

    })
    // Listar
    router.get('/', async (req, res) => {
        try {
            const users = await User.findAll();
            res.status(200).json({ data: users  });
        } catch (error) {
            return res.status(500).json({ message: error.message, error });
        }
    })
    // Buscar expecifico por ID
    router.get('/:id', async (req, res) => {

    })
    
    // Update  - (PATCH -> Atualizar parte do objeto, exemplo somente um campo )
    router.patch('/:id', async (req, res) => {
    
    })

    // Deletar 
    router.delete('/:id', async (req, res) => {
        
    })
  
 module.exports = router
