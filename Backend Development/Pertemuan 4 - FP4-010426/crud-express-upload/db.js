const mysql = require('mysql2');

const conn = mysql.createConnection({ // temporary use, db will vanish after 30 min, only tailscale ip
    host: '100.70.169.115',
    user: 'testuser',
    password: 'testpass',
    database: 'testdb'
});

conn.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Connected to database');
    }
});

module.exports = conn;
