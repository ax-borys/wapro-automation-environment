import { getAllProducts } from '@wae/offer';
import { ApiResponse } from '@wae/types';
import { Hono } from 'hono';

import * as wapro from '@wae/wapro';
import * as v from 'valibot';
import {
   syncProducts,
   SyncProductsInput,
   syncProductsInputSchema,
} from '@wae/product';
import { db } from '@wae/db';

export const product = new Hono().get('/', async (c) => {
   const waproProducts = await wapro.getProducts();

   const syncProductsInput: SyncProductsInput = waproProducts.map(
      (product): SyncProductsInput[number] => ({
         externalId: String(product.id),
         src: 'wapro',
         name: product.name,
         imgSrc: 'absent',
         tax: Number(product.tax) as 0 | 8 | 23,
         stock: product.stock,
      }),
   );

   const validatedSyncProductsInput = v.parse(
      syncProductsInputSchema,
      syncProductsInput,
   );

   await db.transaction((tx) =>
      syncProducts(tx, validatedSyncProductsInput, { scope: ['wapro'] }),
   );

   const products = await getAllProducts();

   return c.json<ApiResponse<typeof products>>({
      data: products,
      error: null,
   });
});
