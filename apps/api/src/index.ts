import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { recordReceiptHandler } from './receipt/controller.js';

const app = new Hono();

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
