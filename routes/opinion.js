const express = require('express');
const router = express.Router();
const opinionController = require('../controllers/opinionController');

// Rutas para las opiniones
router.get('/', opinionController.getAllOpinions);
router.post('/', opinionController.createOpinion);
router.delete('/:id', opinionController.deleteOpinion);

module.exports = router;