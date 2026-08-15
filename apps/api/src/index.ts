import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { recordReceiptHandler } from './receipt/controller.js';

import { serveStatic } from '@hono/node-server/serve-static';
import { cors } from 'hono/cors';

const app = new Hono();

app.use(
   '*',
   cors({
      origin: 'http://localhost:8081',
   }),
);

app.use(
   '/public/*',
   serveStatic({
      root: path.resolve(__dirname, '../'),
   }),
);

app.get('/', (c) => {
   return c.text('Hello Hono!');
});

app.post('/record-receipts', recordReceiptHandler);

serve(
   {
      fetch: app.fetch,
      port: 8082,
   },
   (info) => {
      console.log(`Server is running on http://localhost:${info.port}`);
   },
);
