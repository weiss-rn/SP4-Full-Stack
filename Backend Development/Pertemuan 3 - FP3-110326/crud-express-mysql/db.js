const mysql = require('mysql2');

// Create a MySQL connection pool for efficient query handling
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'crud_db',
  connectionLimit: 10,
  queueLimit: 0,
  waitForConnections: true,
});

module.exports = pool;