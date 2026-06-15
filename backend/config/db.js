const mysql = require('mysql2');
require('dotenv').config();

console.log('MYSQLHOST:', process.env.MYSQLHOST);

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ MySQL Connected Successfully');
    connection.release();
  }
});

module.exports = pool;