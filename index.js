// Carga las variables de entorno desde el archivo .env
require('dotenv').config();

// Importación de dependencias
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Configuración de CORS
app.use(cors({
  origin: "http://localhost:4321", // URL del frontend
  credentials: true // Permitir envío de cookies y credenciales
}));

// Middleware para el manejo de JSON en las solicitudes
app.use(express.json());

// Inicio del servidor
app.listen(port, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${port}`);
});

// Ruta principal para verificar el estado del servidor
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

// Hacer estáticos los archivos subidos
app.use('/uploads', express.static('uploads'));

// Rutas para la funcionalidad de galería
const galleryRoutes = require("./routes/gallery");
app.use("/gallery", galleryRoutes);

// Rutas para la funcionalidad de usuarios
const userRoutes = require('./routes/users');
app.use('/users', userRoutes);

// Importar y usar rutas de los controladores
// Rutas para la funcionalidad de citas
const appointmentRoutes = require("./routes/appointments");
app.use("/appointments", appointmentRoutes);

const transactionsRoutes = require('./routes/transactions');
app.use('/transactions', transactionsRoutes);

const opinionRoutes = require('./routes/opinion');
app.use('/opinion', opinionRoutes);