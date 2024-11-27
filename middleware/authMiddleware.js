require('dotenv').config();
const jwt = require('jsonwebtoken');
// const asyncHandler = require('express-async-handler');

const protect = async (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).json({ message: 'Token não fornecido', stack: null})

    const parts = authHeader.split(' ');
  
    if (parts.length !== 2) return res.status(401).json({ message: 'Token mal formatado', stack: null})

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) return res.status(401).json({ message: 'Token mal formatado', stack: null})

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Sessão expirada', stack: null}) 
        
        req.userId = decoded.id;
        next();
    });

}

const protectADM = async (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).json({ message: 'Token não fornecido', stack: null})

    const parts = authHeader.split(' ');
  
    if (parts.length !== 2) return res.status(401).json({ message: 'Token mal formatado', stack: null})

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) return res.status(401).json({ message: 'Token mal formatado', stack: null})

    jwt.verify(token, process.env.JWT_SECRET_ADM, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Sessão expirada', stack: null}) 
        req.isAdmin = true;
        req.userId = decoded.id;
        next();
    });
}

module.exports = { protect, protectADM }