// lib/db.js
import mysql from "mysql2/promise";

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "streetkicks",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const db = mysql.createPool(dbConfig);

// Test connection on startup
db.getConnection()
  .then(connection => {
    console.log('✅ Connected to MySQL database:', dbConfig.database);
    connection.release();
  })
  .catch(error => {
    console.error('❌ MySQL connection failed:');
    console.error('   Host:', dbConfig.host);
    console.error('   Database:', dbConfig.database);
    console.error('   Error:', error.message);
    console.error('💡 Please ensure:');
    console.error('   1. MySQL server is running');
    console.error('   2. Database "streetkicks" exists');
    console.error('   3. Username and password are correct');
  });

export default db;