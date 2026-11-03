import 'dotenv/config';
import path from 'node:path';
import { defineConfig } from 'drizzle-kit';

const dbFile = process.env.DB_FILE_PATH;
if (!dbFile) throw new Error('DB_FILE_PATH is not set');

const dbPath = path.resolve(dbFile);

export default defineConfig({
   out: './drizzle',
   schema: './src/schemas/',
   dialect: 'sqlite',
   dbCredentials: {
      url: `file:${dbPath}`,
   },
});
