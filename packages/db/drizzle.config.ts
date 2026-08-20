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
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
   out: './drizzle',
   schema: './src/schemas/',
   dialect: 'sqlite',
   dbCredentials: {
      url:
         'file:' +
         path.resolve(__dirname, `../../../../${process.env.DB_FILENAME!}`),
   },
});
