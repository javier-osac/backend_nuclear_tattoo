const pool = require('../config/db'); //conexion a la base de datos
const fs = require('fs');
const path = require('path');

// Subir imagen
const uploadImage = async (req, res) => {
  try {
    const { image_title, image_description, id_user = 1 } = req.body;
    const imagePath = `/uploads/${req.file.filename}`;
    const fileType = req.file.mimetype;

    const result = await pool.query(
      'INSERT INTO gallery (user_id, title, description, image_url, file_type, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [id_user, image_title, image_description, imagePath, fileType]
    );

    res.status(200).json({ success: true, image: result.rows[0] });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ success: false, error: 'Error al subir imagen' });
  }
};

// Obtener imágenes
const getGallery = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM gallery ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener las imágenes:', error);
    res.status(500).json({ error: 'Error al obtener las imágenes' });
  }
};

// Eliminar imagen
const deleteImage = async (req, res) => {
  const { id } = req.params;

  try {
    // Obtener la información de la imagen desde la base de datos antes de eliminarla
    const result = await pool.query('SELECT image_url FROM gallery WHERE gallery_id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Imagen no encontrada' });
    }

    const imageUrl = result.rows[0].image_url;
    const imagePath = path.join(__dirname, '..', imageUrl); // Ruta completa al archivo

    // Eliminar la entrada de la base de datos
    await pool.query('DELETE FROM gallery WHERE gallery_id = $1', [id]);

    // Eliminar el archivo físico del sistema de archivos
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error('Error al eliminar el archivo:', err);
        return res.status(500).json({ success: false, message: 'Error al eliminar archivo del servidor' });
      }

      res.json({ success: true, message: 'Imagen eliminada correctamente' });
    });
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

module.exports = {
  uploadImage,
  getGallery,
  deleteImage,
};