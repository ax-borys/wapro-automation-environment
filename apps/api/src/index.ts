import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { serve } from '@hono/node-server';
import { Hono, type Env } from 'hono';
import {
   recordReceiptsHandler,
   getReceiptsHandler,
} from './receipt/controller.js';

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
import {
   addItemInputSchema,
   addProductInputSchema,
   createOfferInputSchema,
} from '@wae/offer';
import {
   addItemsHandler,
   addProductsHandler,
   createOfferHandler,
   getAllOffersWithItemsHandler,
   getOffersHandler,
} from './offer/controller.js';
import {
   createReceiptsInputSchema,
   getReceiptsInputSchema,
} from '@wae/receipt';
import { getProducts } from '@wae/wapro';
import { ApplyGlobalResponse } from 'hono/client';
import { createFactory } from 'hono/factory';

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

const app = new Hono()
   .use(
      '*',
      cors({
         origin: 'http://localhost:8081',
      }),
   )
   .use(
      '/public/*',
      serveStatic({
         root: path.resolve(__dirname, '../'),
      }),
   )
   .get('/', (c) => {
      return c.text('Hello Hono!');
   })
   .post(
      '/record-receipts',
      vValidator('json', createReceiptsInputSchema, valibotHook),
      ...recordReceiptsHandler,
   )
   .post(
      '/get-receipts',
      vValidator('json', getReceiptsInputSchema, valibotHook),
      ...getReceiptsHandler,
   )
   .post(
      '/create-offer',
      vValidator('json', createOfferInputSchema, valibotHook),
      ...createOfferHandler,
   )
   .get('/get-offers', ...getOffersHandler)
   .get('/get-all-offers-with-items', ...getAllOffersWithItemsHandler)
   .post(
      '/add-items',
      vValidator('json', addItemInputSchema, valibotHook),
      ...addItemsHandler,
   )
   .post(
      '/add-products',
      vValidator('json', addProductInputSchema, valibotHook),
      ...addProductsHandler,
   )
   .get('/get-products', async (c) => {
      const result = await getProducts();
      return c.json<ApiResponse<typeof result>>({ data: result, error: null });
   })
   .onError((error, c) => {
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

export type AppType = ApplyGlobalResponse<
   typeof app,
   Omit<
      {
         [key: number]: ApiResponse<ApiError>;
      },
      200
   >
>;

serve(
   {
      fetch: app.fetch,
      port: 8082,
   },
   (info) => {
      console.log(`Server is running on http://localhost:${info.port}`);
   },
);
