// Simple migration runner: executes migrations/001_init.sql
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

(async function run() {
  // read all .sql files and execute them in sorted order
  const files = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort();
  const sql = files.map((f) => fs.readFileSync(path.join(MIGRATIONS_DIR, f), 'utf8')).join('\n');
  const {
    DB_HOST = '127.0.0.1',
    DB_PORT = '3306',
    DB_USER = 'root',
    DB_PASSWORD = '',
    DB_NAME = 'gamesta'
  } = process.env;

  console.log('Running migration against', { DB_HOST, DB_PORT, DB_USER, DB_NAME });

  const conn = await mysql.createConnection({ host: DB_HOST, port: Number(DB_PORT), user: DB_USER, password: DB_PASSWORD, multipleStatements: true });
  try {
    const [result] = await conn.query(sql);
    console.log('Migration executed.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err && err.message ? err.message : err);
    process.exit(1);
  } finally {
    await conn.end();
  }
})();
