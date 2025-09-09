const mysql = require('mysql2');

const config = process.env.NODE_ENV === 'production' 
  ? {
    // Configuración Cloud SQL
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'protestos',
    socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 60000
  }
  : {
      // Configuración XAMPP
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'protestos',
      port: 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };

const pool = mysql.createPool(config);

const promisePool = pool.promise();

module.exports = {
  pool: pool,
  promisePool: promisePool
};