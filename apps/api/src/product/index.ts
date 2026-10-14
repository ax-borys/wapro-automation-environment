import { addProductInputSchema, addProducts, getAllProducts } from '@wae/offer';
import { ApiResponse } from '@wae/types';
import { Hono } from 'hono';

import * as wapro from '@wae/wapro';
import * as v from 'valibot';

export const product = new Hono()
   .get('/', async (c) => {
      const products = await getAllProducts();

      return c.json<ApiResponse<typeof products>>({
         data: products,
         error: null,
      });
   })
   .get('/sync-products', async (c) => {
      const data = await syncProducts();

      return c.json<ApiResponse<typeof data>>({ data, error: null });
   });

export async function syncProducts() {
   const waproProducts = await wapro.getProducts();

   const filteredWaproProducts = waproProducts.filter(
      (p) => !Number.isNaN(Number.parseInt(p.tax || '')),
   );

   const productsInput = filteredWaproProducts.map((wp) => ({
      externalId: wp.id.toString(),
      name: wp.name,
      tax: Number.parseInt(wp.tax || ''),
      stock: Number.parseInt(String(wp.stock)),
   }));

   const validatedProductsInput = v.parse(
      v.array(addProductInputSchema),
      productsInput,
   );

   const existingProducts = await getAllProducts();

   const notExistingProductsInput = validatedProductsInput.filter(
      (i) => !existingProducts.map((j) => j.externalId).includes(i.externalId),
   );

   const products = await addProducts(notExistingProductsInput);

   return products;
}
