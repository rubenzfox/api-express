const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mariadb = require('mariadb');

const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configuración de MariaDB
const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  //host: 'serverless-us-west1.sysp0000.db2.skysql.com',
  //port: 4017,
  //user: 'dbpgf31924605',
  //password:  '[iDI1nJe6lHt87SzwHi+lBdP9',
  //database:  'mysql',
  connectionLimit: 5,
  connectTimeout: 10000,   // 10 segundos para establecer la conexión
  acquireTimeout: 10000,    // 10 segundos para obtener una conexión del pool
  
  ssl: {
      // Provide at least one field (e.g., ca) to enable TLS verification.
      // Load PEM files into strings or Buffers:
      
      ca: fs.readFileSync('globalsignrootca.pem', 'utf8'),          // required if server cert validation is enforced
      
      //F:\capacitaciones\SPA Node Js-Vue\MariaDB
      // key: fs.readFileSync('/path/to/client-key.pem', 'utf8'), // only if client cert auth required
      // cert: fs.readFileSync('/path/to/client-cert.pem', 'utf8'),
      rejectUnauthorized: true
    }
  
});;

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
    //await pool.end();
  }
});

app.get('/api/db-test', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query('SELECT 1+1 as resultado');
    res.json({ success: true, message: 'Conexión exitosa', data: result });
  } catch (err) {
    console.error('Error en /api/db-test:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});