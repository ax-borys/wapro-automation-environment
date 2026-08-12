import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../../../.env');

dotenv.config({
   path: envPath,
});

import mssql from 'mssql';
import { drizzle } from 'drizzle-orm/node-mssql';

if (!process.env.DATABASE_URL) {
   throw new Error('DATABASE_URL is not set');
}

const pool = await mssql.connect({
   server: '127.0.0.1', 
   user: 'sa', 
   password: 'qwerty', 
   database: 'WAPRO_DEMO', 
   options: {
      encrypt: false, 
      trustServerCertificate: true
   },
   requestTimeout: 120_000,
   connectionTimeout: 60_000,
})

export const db = drizzle({client: pool});
