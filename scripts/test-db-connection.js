// Simple DB connection test using mysql2
const mysql = require('mysql2/promise');
require('dotenv').config();

const {
  DB_HOST = '127.0.0.1',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'gamesta'
} = process.env;

async function test() {
  console.log('Testing DB connection with: ', { DB_HOST, DB_PORT, DB_USER, DB_NAME });
  try {
    const conn = await mysql.createConnection({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      connectTimeout: 5000
    });
    const [rows] = await conn.execute('SELECT 1 as ok');
    console.log('Query result:', rows);
    await conn.end();
    process.exit(0);
  } catch (e) {
    console.error('DB connection failed:', e && e.message ? e.message : e);
    if (e && e.code) console.error('Error code:', e.code);
    process.exit(1);
  }
}

test();
