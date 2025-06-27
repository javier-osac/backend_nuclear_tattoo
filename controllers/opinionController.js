const pool = require('../config/db'); // Configuración de la conexión a la base de datos

// Obtener todas las opiniones
exports.getAllOpinions = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM opinion_box');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener las opiniones:', error);
        res.status(500).json({ message: 'Error al obtener las opiniones' });
    }
};

// Crear una nueva opinión
exports.createOpinion = async (req, res) => {
    const { name, qualification, opinion_date, service, description } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO opinion_box (name, qualification, opinion_date, service, description) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [name, qualification, opinion_date, service, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear la opinión:', error);
        res.status(500).json({ message: 'Error al crear la opinión' });
    }
};

// Eliminar una opinión
exports.deleteOpinion = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM opinion_box WHERE id_opinion = $1 RETURNING *',
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Opinión no encontrada' });
        }

        res.status(200).json({ message: 'Opinión eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar la opinión:', error);
        res.status(500).json({ message: 'Error al eliminar la opinión' });
    }
};
