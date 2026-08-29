import { addProductInputSchema, addProducts } from '@wae/offer';
import { dbWapro, getProducts } from '@wae/wapro';
import * as v from 'valibot';

export async function syncProducts() {
   const waproProducts = await getProducts();

   console.log(waproProducts);

   const productsInput = waproProducts.map((wp) => ({
      externalId: wp.id.toString(),
      name: wp.name,
      tax: Number.parseInt(wp.tax || ''),
   }));

   const validatedProductsInput = v.parse(
      v.array(addProductInputSchema),
      productsInput,
   );

   const products = await addProducts(validatedProductsInput);

   return products;
}
