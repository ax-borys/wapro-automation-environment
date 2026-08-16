import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { recordReceiptHandler } from './receipt/controller.js';

import { serveStatic } from '@hono/node-server/serve-static';
import { cors } from 'hono/cors';
import { vValidator } from '@hono/valibot-validator';
import { generateReceiptsInputSchema } from '@wae/receipt/src/schema.js';
import { ValiError } from 'valibot';
import mssql from 'mssql';
import type { ApiError, ApiResponse } from '@wae/types';
import { AppError } from '@wae/core';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
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

app.post(
   '/record-receipts',
   vValidator('json', generateReceiptsInputSchema, (result) => {
      if (!result.success) {
         throw new ValiError(result.issues);
      }
   }),
   recordReceiptHandler,
);

app.onError((error, c) => {
   let message = null;
   let code = null;
   let status: ContentfulStatusCode = 500;

   if (error instanceof ValiError) {
      status = 400;
      code = 'VALIDATION';
      message = error.message;
   } else if (error instanceof mssql.RequestError) {
      message = error.message;
      code = error.name;
   } else if (error instanceof mssql.TransactionError) {
      message = error.message;
      code = error.name;
   } else if (error instanceof AppError) {
      message = error.message;
      code = error.code;
      status = error.status as ContentfulStatusCode;
   }

   return c.json<ApiResponse<ApiError>>(
      {
         error: {
            code: code || 'INTERNAL_ERROR',
            message: message || 'Something went wrong',
         },
         data: null,
      },
      status,
   );
});

serve(
   {
      fetch: app.fetch,
      port: 8082,
   },
   (info) => {
      console.log(`Server is running on http://localhost:${info.port}`);
   },
);
