const multer  = require('multer')
const path = require('path');
const fs = require('fs');

function isImage(file) {
	const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
	const fileExtension = path.extname(file.originalname).toLowerCase();
	return allowedExtensions.includes(fileExtension);
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const baseDirectory = 'uploads/products';
		const eventDirectory = path.join(baseDirectory, req.body.idProduct.toString());

		// Verifique se os diretórios existem e crie-os, se não existirem
		fs.mkdirSync(baseDirectory, { recursive: true });
		fs.mkdirSync(eventDirectory, { recursive: true });

		cb(null, eventDirectory);
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + '-' + file.originalname);
	}
});

const fileFilter = (req, file, cb) => {
	if (isImage(file)) {
		cb(null, true);
	} else {
		cb(new Error('Arquivo não é uma imagem.'), false);
	}
};

const upload = multer({ storage, fileFilter });

module.exports = upload;