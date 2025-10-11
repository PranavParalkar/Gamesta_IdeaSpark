const mysql = require('mysql2/promise');
require('dotenv').config();

(async function(){
  const {
    DB_HOST='127.0.0.1', DB_PORT='3306', DB_USER='root', DB_PASSWORD='', DB_NAME='gamesta'
  } = process.env;
  console.log('Using DB config:', {DB_HOST, DB_PORT, DB_USER, DB_NAME});
  try{
    const conn = await mysql.createConnection({ host: DB_HOST, port: Number(DB_PORT), user: DB_USER, password: DB_PASSWORD, database: DB_NAME });
    const [rows] = await conn.execute("SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'", [DB_NAME]);
    console.log('users table columns:');
    console.table(rows);
    await conn.end();
    process.exit(0);
  }catch(e){
    console.error('Error connecting or querying:', e.message || e);
    process.exit(1);
  }
})();
