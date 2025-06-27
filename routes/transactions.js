const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactionsController');
const upload = require('../middleware/multerConfig'); // Importar multerConfig


// CRUD routes
router.get('/', transactionsController.getAllTransactions);
router.get('/:id', transactionsController.getTransactionById);
router.post('/', upload.single('receipt'), transactionsController.createTransaction);
router.put("/:id", upload.single("edit_receipt"), transactionsController.updateTransaction);
router.delete('/:id', transactionsController.deleteTransaction);


module.exports = router;