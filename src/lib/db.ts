import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const {
  DB_HOST = '127.0.0.1',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'gamesta',
  DB_CONNECTION_LIMIT = '10'
} = process.env;

const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(DB_CONNECTION_LIMIT),
  queueLimit: 0,
  // Fail fast in dev when the DB is unreachable (prevents 15s+ hangs and vague errors)
  connectTimeout: 5_000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

export async function query(sql: string, params?: any[]) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as any;
  } catch (err: any) {
    // Add actionable context while preserving the original error/code.
    const code = err?.code ? ` code=${String(err.code)}` : '';
    const hostPort = `${DB_HOST}:${DB_PORT}`;
    const hint =
      err?.code === 'ETIMEDOUT' || err?.code === 'ECONNREFUSED' || err?.code === 'ENOTFOUND'
        ? `DB connection failed to ${hostPort}. Verify MySQL is running and env vars DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME are correct.`
        : `DB query failed against ${hostPort}.`;

    const wrapped = new Error(`${hint}${code}`);
    (wrapped as any).cause = err;
    (wrapped as any).code = err?.code;
    throw wrapped;
  }
}

export default pool;
