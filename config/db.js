// Importa el módulo 'pg' para gestionar la conexión a la base de datos PostgreSQL
const { Pool } = require('pg');

// Configuración de la conexión a la base de datos
const pool = new Pool({
  user: 'postgres',           // Usuario de la base de datos
  host: 'localhost',          // Dirección del host de la base de datos
  database: 'nuclear_tattoo', // Nombre de la base de datos
  password: 'amorde123',      // Contraseña del usuario (reemplázala con la real)
  port: 5432,                 // Puerto en el que está corriendo PostgreSQL
});

// Exporta el pool para que pueda ser utilizado en otros archivos
module.exports = pool;