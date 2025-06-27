const pool = require('../config/db');
const fs = require('fs');
const path = require('path');


module.exports = {
    getAllTransactions: async (req, res) => {
        try {
            const result = await pool.query('SELECT * FROM transactions'); // Cambiar db por pool
            res.json(result.rows);
        } catch (err) {
            console.error(err.message); // Para depuración
            res.status(500).json({ error: err.message });
        }
    },

    getTransactionById: async (req, res) => {
        const { id } = req.params;
        try {
            const result = await pool.query('SELECT * FROM transactions WHERE id_transaction = $1', [id]); // Cambiar db por pool
            res.json(result.rows[0]);
        } catch (err) {
            console.error(err.message); // Para depuración
            res.status(500).json({ error: err.message });
        }
    },

    createTransaction: async (req, res) => {
        const { transaction_date, amount, description, transaction_type, category, payment_method } = req.body;

        // Obtén la ruta del archivo subido desde `req.file`
        const receipt = req.file ? `/uploads/${req.file.filename}` : null;

        try {
            const result = await pool.query(
                `INSERT INTO transactions (transaction_date, amount, description, transaction_type, category, payment_method, receipt) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [transaction_date, amount, description, transaction_type, category, payment_method, receipt]
            );
            res.json(result.rows[0]);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: err.message });
        }
    },

    updateTransaction: async (req, res) => {
        const { id } = req.params;
        const { transaction_date, amount, description, transaction_type, category, payment_method } = req.body;

        // Verifica si se subió un archivo y agrega el prefijo '/uploads/'
        const newReceipt = req.file ? `/uploads/${req.file.filename}` : null;

        try {
            // Obtén la transacción actual
            const existingTransaction = await pool.query(
                'SELECT receipt FROM transactions WHERE id_transaction = $1',
                [id]
            );

            if (existingTransaction.rows.length === 0) {
                return res.status(404).json({ error: 'Transacción no encontrada' });
            }

            const currentReceipt = existingTransaction.rows[0].receipt;

            // Si hay un archivo nuevo y existe uno anterior, eliminar el archivo viejo
            if (newReceipt && currentReceipt) {
                const oldFilePath = path.join(__dirname, '..', currentReceipt.replace('/uploads/', 'uploads/'));

                if (fs.existsSync(oldFilePath)) {
                    fs.unlink(oldFilePath, (err) => {
                        if (err) {
                            console.error(`Error eliminando archivo anterior: ${oldFilePath}`, err);
                        }
                    });
                } else {
                    console.warn(`Archivo anterior no encontrado: ${oldFilePath}`);
                }
            }

            // Actualiza la transacción en la base de datos
            const result = await pool.query(
                `UPDATE transactions 
             SET transaction_date = $1, amount = $2, description = $3, transaction_type = $4, 
                 category = $5, payment_method = $6, receipt = $7, edition_date_time = CURRENT_TIMESTAMP
             WHERE id_transaction = $8 RETURNING *`,
                [transaction_date, amount, description, transaction_type, category, payment_method, newReceipt || currentReceipt, id]
            );

            res.json(result.rows[0]);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: err.message });
        }
    },

    deleteTransaction: async (req, res) => {
        const { id } = req.params;
        try {
            await pool.query('DELETE FROM transactions WHERE id_transaction = $1', [id]); // Cambiar db por pool
            res.json({ message: 'Transaction deleted successfully' });
        } catch (err) {
            console.error(err.message); // Para depuración
            res.status(500).json({ error: err.message });
        }
    }
};