// Importaciones necesarias
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { checkPermission } = require('../middleware/roleMiddleware');

// Rutas para el manejo de usuarios

// Obtener la lista de usuarios
router.get('/', userController.getUsers);

// Registrar un nuevo usuario
router.post('/register', userController.registerUser);

// Iniciar sesión de usuario
router.post('/login', userController.loginUser);

// Solicitar el restablecimiento de contraseña
router.post('/request-password-reset', userController.requestPasswordReset);

// Restablecer la contraseña usando un token
router.post('/reset-password', userController.resetPassword);

/////////////////////////////////
//Rutas protegidas
router.get('/', checkPermission('manage_users'), userController.getUsers); // Solo 'admin' puede listar usuarios

// Ruta protegida para modificar galeria (solo admin)
router.get('/modgaleria', checkPermission('manage_gallery'), (req, res) => {
  res.json({ message: 'Acceso permitido a usuarios con permiso manage_users' });
});
////////////////////////////////

// Exportar el enrutador
module.exports = router;