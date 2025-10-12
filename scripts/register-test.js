// Test registration directly against DB to match signup route behavior
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

(async function(){
  const email = process.argv[2] || 'testuser1234@gmail.com';
  const password = process.argv[3] || 'password123';
  const name = process.argv[4] || email.split('@')[0];

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try{
    console.log('Checking existing email...');
    const [existing] = await conn.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      console.log('Email already exists, exiting.');
      process.exit(0);
    }

    const hash = await bcrypt.hash(password, 10);
    const [res] = await conn.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hash]);
    console.log('Inserted ID:', res.insertId);
  } catch(e){
    console.error('Register test failed:', e.message);
    process.exit(1);
  } finally{
    await conn.end();
  }
})();