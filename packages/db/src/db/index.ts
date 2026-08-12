import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../../../.env');

dotenv.config({
   path: envPath,
   quiet: true,
});

import mssql from 'mssql';
import { drizzle } from 'drizzle-orm/node-mssql';

if (!process.env.DB_HOST) {
   throw new Error('DB_HOST is not set');
}
if (!process.env.DB_USER) {
   throw new Error('DB_USER is not set');
}
if (!process.env.DB_PASSWORD) {
   throw new Error('DB_PASSWORD is not set');
}
if (!process.env.DB_NAME) {
   throw new Error('DB_NAME is not set');
}

const pool = await mssql.connect({
   server: process.env.DB_HOST!,
   user: process.env.DB_USER!,
   password: process.env.DB_PASSWORD!,
   database: process.env.DB_NAME!,
   options: {
      encrypt: false,
      trustServerCertificate: true,
   },
   requestTimeout: 120_000,
   connectionTimeout: 60_000,
});

export function closeConnection() {
   return pool.close();
}

export const db = drizzle({ client: pool });
