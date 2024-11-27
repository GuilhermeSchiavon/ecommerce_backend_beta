// Importação para gerar a Rotas do Usuário
const router =  require('express').Router();
const { Sequelize } = require('sequelize');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require("../models/User")
const UserAddress = require("../models/UserAddress")
const Order = require("../models/Order")
const { protect, protectADM } = require('../middleware/authMiddleware')

    router.post('/signup', async (req, res) => {
        const { firstName, lastName, email, password, phone, cpf} = req.body;
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            if(existingUser.accountStatus == 'pendente'){
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                
                const payload = { email: email, type: 'confirmation' };
                const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

                await existingUser.update({ password: hashedPassword, token });

                delete existingUser.dataValues.password;
                delete existingUser._previousDataValues.password;

                return res.status(200).json({
                    message: 'Enviamos um novo email de validação para o endereço de email fornecido', 
                    user: existingUser
                });
            }
            return res.status(409).json({ message: 'Este email já está sendo usado' });
        }
    
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
    
        const payload = { email: email, type: 'confirmation' };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '24h'
        });

        
        const newUser = await User.create({ firstName, lastName, email, password: hashedPassword, phone, cpf, lastActiveAt: new Date(), token });
        delete newUser.dataValues.password;
        delete newUser._previousDataValues.password;
        res.status(201).json({ 
            message: 'Conta criada com sucesso, eviamos um novo email de validação', 
            user: newUser 
        });
    });

    router.post('/', protectADM, async (req, res) => {
        const { firstName, lastName, email, phone, cpf} = req.body;
        const sanitizedPhone = phone && phone.trim() !== '' ? phone : null;
        const sanitizedCpf = cpf && cpf.trim() !== '' ? cpf : null;
        try {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {return res.status(500).json({ message: 'Já existe uma Usuário com este e-mail.' })}
            
            const newUser = await User.create({
                firstName,
                lastName,
                email,
                phone: sanitizedPhone,
                cpf: sanitizedCpf,
                password: "$2b$10$myxDobX8BdDcHZN58HNRI.NKtzQ4uOuTurbiXG3DlNY0eAJvEfRKW",
                lastActiveAt: new Date(),
                token: "Create from ADM"
            });

            delete newUser.dataValues.password;
            delete newUser._previousDataValues.password;
            res.status(201).json({ message: "Usuário criada com sucesso!", user: newUser });
        } catch (error) {
            return res.status(500).json({ message: "Falha ao criar o Usuário!", error });
        }
    });
    
    router.get("/", protectADM, async (req, res) => {
        try {
            const keyword = req.query.keyword || "";
            const pageNumber = Number(req.query.pageNumber) || 1;
            const pageSize = 12;
            const offset = (pageNumber - 1) * pageSize;
    
            const { count, rows: itens } = await User.findAndCountAll({
                where: {
                    [Sequelize.Op.or]: [
                        Sequelize.literal(`firstName LIKE '%${keyword}%'`),
                        Sequelize.literal(`lastName LIKE '%${keyword}%'`),
                        Sequelize.literal(`email LIKE '%${keyword}%'`),
                        Sequelize.literal(`accountStatus LIKE '%${keyword}%'`),
                    ]
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
            res.status(500).json({ message: error.message });
        }
    });
   
    router.get("/:id", protectADM, async (req, res) => {
        try {
            const id = req.params.id;
            const user = await User.findByPk(id, {
                include: [
                    {
                        model: UserAddress,
                        as: 'addresses',
                        order: [
                            ['default', 'DESC'],
                            ['id', 'DESC']
                        ]
                    },
                    {
                        model: Order,
                        order: [
                            ['createdAt', 'DESC']
                        ]
                    }
                ],
                attributes:{
                    exclude: ['password', 'token']
                }
            });
    
            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            res.status(200).json({
                user
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    router.post('/newToken', async (req, res) => {
        const { email, password} = req.body;
    
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({message: "Usuário e/ou senha inválido(s)", stack: null})
        }

        //gerando o token de validação
        const payload = { email: email, type: 'confirmation' };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '24h'
        });

        user.token = token;
        user.lastActiveAt = new Date();

        await user.save();
        delete user.dataValues.password;
        delete user._previousDataValues.password;
        res.status(201).json( user );
    });
  
    router.post('/login', async (req, res) => {
        const { email, password }  = req.body;
        try {
            const user = await User.findOne({ where: { email } });
            
            if (!user) {
                return res.status(401).json({message: "Usuário e/ou senha inválido(s)", stack: null})
            }

            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                return res.status(401).json({message: "Usuário e/ou senha inválido(s)", stack: null})
            }

            if(user.accountStatus == 'pendente'){
                const payload = { email: email, type: 'confirmation' };
                const token_validacao = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

                await user.update({ token_validacao });

                return res.status(200).json({
                    message: 'Enviamos um novo email de validação para o endereço de email fornecido', 
                    user
                });
            }

            if(user.accountStatus == 'ativa'){
                const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.TOKEN_EXPIRES
                });

                delete user.dataValues.password;
                delete user._previousDataValues.password;

                return res.status(200).json({ user, token });
            }
            return res.status(401).json({message: "Sua conta esta inativa, caso de dúvida entre em contato com o suporte.", stack: null})
        
        } catch (error) {
            return res.status(500).json({ message: error.message, error });
        }
    })

    router.get('/profile', protect, async (req, res) => {
        try {
                const userId = req.userId
                const user = await User.findOne({ where:  userId  });
    
                if (!user) {
                    return res.status(401).json({message: "Usuário não encontrado.", stack: null})
                }
    
                const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.TOKEN_EXPIRES
                });
                delete user.dataValues.password;
                delete user._previousDataValues.password;
                return res.status(200).json({ user, token });

        } catch (error) {
            return res.status(500).json({ message: error.message, error });
        }
    });

    router.put('/update', protect, async (req, res) => {
        try{
            const { firstName, lastName, phone } = req.body;
        
            const user = await User.findByPk(req.userId);
            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            user.firstName = firstName || user.firstName;
            user.lastName = lastName || user.lastName;
            user.phone = phone || user.phone;
            user.lastActiveAt = new Date();
        
            await user.save();
        
            const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
                expiresIn: process.env.TOKEN_EXPIRES
            });

            delete user.dataValues.password;
            delete user._previousDataValues.password;

            res.json({ user, token });
        } catch (error) {
            return res.status(500).json({ message: error.message, error });
        }
    });

    router.put("/update/user/:id", protectADM, async (req, res) => {
        const id = req.params.id;
        const updatedData = req.body;
		
        try {
          const user = await User.findByPk(id);
      
          if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrada' });
          }
      
          await user.update(updatedData);

          res.status(200).json({user, message: "Usuário Atualizada"});
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
	});

    router.get('/confirmAcount/:token', async (req, res) => {
        const token = req.params.token;
        
        try {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            const email = decodedToken.email;
            const user = await User.findOne({ where: { email } });
    
            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }
            
            if (user.accountStatus == 'ativa'){
                return res.status(404).json({ message: 'Conta já foi ativada' });
            }

            if (user.token !== token) {
                return res.status(403).json({ message: 'Token inválido' });
            }
    
            await user.update({ accountStatus: 'ativa', token: 'true' });
    
            
            const loginToken = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
                expiresIn: process.env.TOKEN_EXPIRES
            });

            delete user.dataValues.password;
            delete user._previousDataValues.password;

            return res.status(200).json({ message: 'Conta validada com sucesso', user, token: loginToken });

        } catch (error) {
            return res.status(401).json({ message: 'Token expirado ou inválido' });
        }
    });

 module.exports = router