const express = require('express');
const router = express.Router();
const upload = require('../middleware/multerConfig');
const galleryController = require('../controllers/galleryController');

router.post('/', upload.single('image_file'), galleryController.uploadImage);
router.get('/', galleryController.getGallery);
router.delete('/:id', galleryController.deleteImage);

module.exports = router;
