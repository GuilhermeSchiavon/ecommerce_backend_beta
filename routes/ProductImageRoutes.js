const router = require('express').Router();
const express = require('express');
const Product = require("../models/Product")
const ProductImage = require("../models/ProductImage")
const Image = require("../models/Image")
const { protectADM } = require('../middleware/authMiddleware')
const uploadImages = require('../middleware/uploadImages')
const fs = require('fs');
const path = require('path');

// Model de Pagamento
    router.patch("/images", express.json({ limit: '50mb' }), protectADM, uploadImages.array('images', 20), async (req, res) => {
        try{
            
            const newImages = JSON.parse(req.body.newImages)
            const oldImages = JSON.parse(req.body.oldImages)
            const { idProduct } = req.body

            const product = await Product.findByPk(idProduct)

            const existingImages = await product.getImages();

            const imagesToRemove = existingImages.filter(existingImage => !oldImages.find(oldImage => oldImage.id === existingImage.id));

            // Remover imagens do sistema de arquivos e do banco de dados
            for (const imageToRemove of imagesToRemove) {
                const filePath = path.join(__dirname, '../uploads/products/', imageToRemove.filename);
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.warn(`Erro ao excluir o arquivo: ${err.message}`);
                    }
                });
            }
            // Atualizar ordem das imagens existentes
            for (const oldImage of oldImages) {
                const image = await Image.findByPk(oldImage.id);
                if (image) {
                    // Atualizar apenas se a imagem existir
                    await image.update({ order: oldImage.order });
                }
            }

            const fileNames = req.files.map((file) => file.filename);
            
            const imageRecords = fileNames.map((filename, index) => {
                return {
                    filename: idProduct + '/' + filename,
                    order: newImages[index].order,
                    type: "produto"
                };
            });
            
            const  createdImages  =  await Image.bulkCreate(imageRecords, { returning: true });
            
            const idsImages = createdImages.map(image => image.id);
            const allImageIds = [...idsImages, ...oldImages.map(image => image.id)];
            // await product.addImages(allImageIds);
            await product.setImages(allImageIds);

            return res.status(200).json({ message: 'Produto atualizado com sucesso' });
  
        } catch (error) {
            return res.status(500).json({ message: error.message, error });
        }
    });

  
 module.exports = router