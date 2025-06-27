const express = require('express');
const router = express.Router();
const upload = require('../middleware/multerConfig');
const galleryController = require('../controllers/galleryController');

// Ruta para subir una nueva imagen a la galería
// Se utiliza el middleware de Multer para manejar la carga del archivo
router.post('/', upload.single('image_file'), galleryController.uploadImage);

// Ruta para obtener todas las imágenes de la galería
router.get('/', galleryController.getGallery);

// Ruta para eliminar una imagen de la galería por ID
router.delete('/:id', galleryController.deleteImage);

// Exportar el router para ser utilizado en la configuración de rutas principales
module.exports = router;