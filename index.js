const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mariadb = require('mariadb');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configuración de MariaDB
const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mi_bd',
  connectionLimit: 5
});

// Endpoint de prueba básico
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API funcionando correctamente' });
});

// Endpoint de prueba con parámetro
app.get('/api/hello/:name', (req, res) => {
  const name = req.params.name || 'Mundo';
  res.json({ message: `Hola ${name}!` });
});

// Endpoint para obtener datos de talcance
app.get('/api/talcance', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM talcance');
    res.json(rows);
  } catch (err) {
    console.error('Error en /api/talcance:', err);
    res.status(500).json({ error: 'Error al obtener datos de talcance' });
  } finally {
    if (conn) conn.release();
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});