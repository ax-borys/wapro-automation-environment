import 'dotenv/config';

//--- inits ---
import './config/init-db';
import './config/init-wapro-db';
import './config/init-allegro-storage';
// ----

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { serve } from '@hono/node-server';
import { Hono } from 'hono';

import { serveStatic } from '@hono/node-server/serve-static';
import { cors } from 'hono/cors';
import { ApplyGlobalResponse } from 'hono/client';
import { offer } from './offer';
import { receipt } from './receipt';
import { product } from './product';
import { type HandledStatusCodes } from '@wae/core';
import { order } from './order';
import { codeToStatus } from '@wae/error';
import { formatError, FormattedError } from './helpers/format-error';

export type ApiError = FormattedError;

export type ApiResponse<T> = T extends ApiError
   ? { data: null; error: ApiError }
   : {
        data: T;
        error: null;
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
   .route('/offer', offer)
   .route('/receipt', receipt)
   .route('/product', product)
   .route('/order', order)
   .onError((error, c) => {
      const formattedError = formatError(error);

      return c.json<ApiResponse<ApiError>>(
         {
            error: formattedError,
            data: null,
         },
         codeToStatus(formattedError.code),
      );
   });

export type AppType = ApplyGlobalResponse<
   typeof app,
   {
      [K in HandledStatusCodes | 500]: {
         json: ApiResponse<ApiError>;
      };
   }
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
