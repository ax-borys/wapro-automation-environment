import { getAllProducts } from '@wae/offer';
import { ApiResponse } from '@wae/types';
import { Hono } from 'hono';

export const product = new Hono().get('/', async (c) => {
   const products = await getAllProducts();

   return c.json<ApiResponse<typeof products>>({
      data: products,
      error: null,
   });
});
