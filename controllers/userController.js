// Importaciones necesarias
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Configura el transporte de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER, // Usuario para el envío de correos
    pass: process.env.EMAIL_PASS, // Contraseña para el envío de correos
  },
});

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key'; // Clave secreta para JWT

// =====================================
// Funciones de usuario
// =====================================

// Registro de usuario
exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body; // Opcionalmente, incluir `role` desde el frontend

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const id_role = role || 3; // Por defecto, cliente

    await pool.query(
      'INSERT INTO users (name, email, password, id_role) VALUES ($1, $2, $3, $4)',
      [name, email, hashedPassword, id_role]
    );

    res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (err) {
    console.error('Error al registrar usuario:', err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

// Inicio de sesión de usuario
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const result = await pool.query(
      'SELECT u.*, r.role_name FROM users u INNER JOIN roles r ON u.id_role = r.id_role WHERE email = $1',
      [email]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Obtener permisos del usuario
    const permissionsQuery = `
      SELECT p.permission_name
      FROM roles_permissions rp
      INNER JOIN permissions p ON rp.id_permission = p.id_permission
      WHERE rp.id_role = $1;
    `;
    const permissionsResult = await pool.query(permissionsQuery, [user.id_role]);
    const permissions = permissionsResult.rows.map((row) => row.permission_name);

    const token = jwt.sign(
      { id: user.id_user, email: user.email, role: user.role_name, permissions },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, message: 'Inicio de sesión exitoso' });
  } catch (err) {
    console.error('Error al iniciar sesión:', err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

// Obtener todos los usuarios
exports.getUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Solicitar restablecimiento de contraseña
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'El correo electrónico es obligatorio' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'Correo no registrado' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiration = new Date(Date.now() + 3600000); // Token válido por 1 hora

    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expiration = $2 WHERE id_user = $3',
      [token, expiration, user.id_user]
    );

    const resetUrl = `http://localhost:4321/reset_password?token=${token}`;
    const mailOptions = {
      to: email,
      subject: 'Restablecer contraseña',
      text: `Haz clic en el enlace para restablecer tu contraseña: ${resetUrl}`,
      html: `<p>Haz clic en el enlace para restablecer tu contraseña:</p><a href="${resetUrl}">${resetUrl}</a>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Correo de restablecimiento enviado' });
  } catch (err) {
    console.error('Error en la solicitud de restablecimiento de contraseña:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Restablecer la contraseña
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token y nueva contraseña son obligatorios' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiration > NOW()',
      [token]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiration = NULL WHERE id_user = $2',
      [hashedPassword, user.id_user]
    );

    res.status(200).json({ message: 'Contraseña restablecida con éxito' });
  } catch (err) {
    console.error('Error al restablecer contraseña:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};