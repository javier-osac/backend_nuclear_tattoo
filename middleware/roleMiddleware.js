const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// Middleware para verificar permisos
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
      
      req.user = decoded; // Agrega el usuario decodificado al objeto `req`

      const userPermissions = req.user.permissions;

      if (!userPermissions.includes(requiredPermission)) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }

      next();
    } catch (error) {
      console.error('Error en la verificación de permisos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
};

module.exports = { checkPermission };