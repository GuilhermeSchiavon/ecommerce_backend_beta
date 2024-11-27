const router =  require('express').Router();
const { Sequelize } = require('sequelize');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Adm = require("../models/Adm")

    router.post('/login', async (req, res) => {
        const { email, password }  = req.body;
        try {
            const existingUser = await Adm.findOne({ where: { email } });

            if (!existingUser) {
                return res.status(401).json({message: "Usuário e/ou senha inválido(s)", stack: null})
            }

                    //gerando o hash da senha usando bcrypt
                // const saltRounds = 10;
                // const hashedPassword = await bcrypt.hash(password, saltRounds);
                // console.log({email, hashedPassword});

            const isValidPassword = await bcrypt.compare(password, existingUser.password);

            if (!isValidPassword) {
                return res.status(401).json({message: "Usuário e/ou senha inválido(s)", stack: null})
            }

            const token = await jwt.sign({ id: existingUser.id }, process.env.JWT_SECRET_ADM, {
                expiresIn: process.env.TOKEN_EXPIRES // expires in 1 hora
            });

            return res.status(200).json({ user: existingUser, token });
        
        } catch (error) {
            return res.status(500).json({ message: error.message, error });
        }
    })

module.exports = router