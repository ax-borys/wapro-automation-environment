import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { serve } from '@hono/node-server';
import { Hono, type Env } from 'hono';
import { recordReceiptHandler } from './receipt/controller.js';

import { serveStatic } from '@hono/node-server/serve-static';
import { cors } from 'hono/cors';
import { vValidator, type Hook } from '@hono/valibot-validator';
import {
   ValiError,
   type GenericSchema,
   type GenericSchemaAsync,
} from 'valibot';
import mssql from 'mssql';
import type { ApiError, ApiResponse } from '@wae/types';
import { AppError } from '@wae/core';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { addItemsInputSchema, createOfferInputSchema } from '@wae/offer';
import {
   addItemsHandler,
   createOfferHandler,
   getOffersHandler,
} from './offer/controller.js';
import { createReceiptsInputSchema } from '@wae/receipt';
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

const valibotHook: Hook<
   GenericSchema | GenericSchemaAsync,
   Env,
   string,
   'json'
> = async (result) => {
   if (!result.success) {
      throw new ValiError(result.issues);
   }
};

app.post(
   '/record-receipts',
   vValidator('json', createReceiptsInputSchema, valibotHook),
   recordReceiptHandler,
);

app.post(
   '/create-offer',
   vValidator('json', createOfferInputSchema, valibotHook),
   createOfferHandler,
);

app.get('/get-offers', getOffersHandler);

app.post(
   '/add-items',
   vValidator('json', addItemsInputSchema, valibotHook),
   addItemsHandler,
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
   } else {
      console.error(error);
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
