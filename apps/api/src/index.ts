import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { serve } from '@hono/node-server';
import { Hono, type Env } from 'hono';

import { serveStatic } from '@hono/node-server/serve-static';
import { cors } from 'hono/cors';
import mssql from 'mssql';
import { ApplyGlobalResponse } from 'hono/client';
import { offer } from './offer';
import { receipt } from './receipt';
import { product } from './product';
import { type HandledStatusCodes } from '@wae/core';
import { order } from './order';
import {
   UpstreamError,
   ValidationError,
   AppError,
   codeToStatus,
} from '@wae/error';
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
      let errorObj: Partial<ApiError> = {};

      if (error instanceof ValidationError) {
         errorObj = formatError(error);
      } else if (error instanceof AppError) {
         errorObj = formatError(error);
      } else if (error instanceof UpstreamError) {
         errorObj = formatError(error);
      } else if (error instanceof mssql.RequestError) {
         errorObj = {
            code: 'INTERNAL',
            message: error.message,
            source: 'app',
            cause: formatError(error),
         };
      } else if (error instanceof mssql.TransactionError) {
         errorObj = {
            code: 'INTERNAL',
            message: error.message,
            source: 'app',
            cause: formatError(error),
         };
      } else {
         errorObj = {
            code: 'INTERNAL',
            message: 'Something went wrong.',
            source: 'app',
            cause: formatError(error),
         };
         console.error(error);
      }

      console.error(errorObj);

      return c.json<ApiResponse<ApiError>>(
         {
            error: errorObj as ApiError,
            data: null,
         },
         codeToStatus((errorObj as ApiError).code),
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
