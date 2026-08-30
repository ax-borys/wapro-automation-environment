import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { serve } from '@hono/node-server';
import { Hono, type Env } from 'hono';

import { serveStatic } from '@hono/node-server/serve-static';
import { cors } from 'hono/cors';
import { ValiError } from 'valibot';
import mssql from 'mssql';
import type { ApiError, ApiResponse } from '@wae/types';
import { AppError } from '@wae/core';
import type {
   ContentfulStatusCode,
   ServerErrorStatusCode,
} from 'hono/utils/http-status';
import { ApplyGlobalResponse } from 'hono/client';
import { offer } from './offer';
import { receipt } from './receipt';
import { product } from './product';
import { type HandledStatusCodes } from '@wae/core';

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
