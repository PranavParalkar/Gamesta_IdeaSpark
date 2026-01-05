import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { Connector } from '@google-cloud/cloud-sql-connector';

dotenv.config();

const {
  DB_HOST = '127.0.0.1',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'gamesta',
  DB_CONNECTION_LIMIT = '10',
  // If set, we'll connect using the Cloud SQL Connector
  CLOUD_SQL_CONNECTION_NAME,
  CLOUD_SQL_IP_TYPE = 'PUBLIC', // or 'PRIVATE'
  // Base64-encoded service account JSON for hosting platforms without ADC files
  GCP_SERVICE_ACCOUNT_JSON_BASE64
} = process.env as Record<string, string>;

let pool: mysql.Pool | null = null;

async function initPool(): Promise<mysql.Pool> {
  if (CLOUD_SQL_CONNECTION_NAME) {
    const creds = GCP_SERVICE_ACCOUNT_JSON_BASE64
      ? JSON.parse(Buffer.from(GCP_SERVICE_ACCOUNT_JSON_BASE64, 'base64').toString('utf8'))
      : undefined;

    const connector = new Connector({ credentials: creds as any });
    const clientOpts = await connector.getOptions({
      instanceConnectionName: CLOUD_SQL_CONNECTION_NAME,
      ipType: (CLOUD_SQL_IP_TYPE as 'PUBLIC' | 'PRIVATE') || 'PUBLIC'
    });

    return mysql.createPool({
      ...clientOpts,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: Number(DB_CONNECTION_LIMIT),
      queueLimit: 0
    });
  }

  return mysql.createPool({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: Number(DB_CONNECTION_LIMIT),
    queueLimit: 0
  });
}

async function getPool(): Promise<mysql.Pool> {
  if (!pool) pool = await initPool();
  return pool;
}

export async function query(sql: string, params?: any[]) {
  const p = await getPool();
  const [rows] = await p.execute(sql, params);
  return rows as any;
}

export default { getPool };
