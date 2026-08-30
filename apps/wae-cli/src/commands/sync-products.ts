import { addProductInputSchema, addProducts, getAllProducts } from '@wae/offer';
import * as wapro from '@wae/wapro';
import * as v from 'valibot';

export async function syncProducts() {
   const waproProducts = await wapro.getProducts();

   const filteredWaproProducts = waproProducts.filter(
      (p) => !Number.isNaN(Number.parseInt(p.tax || '')),
   );

   const productsInput = filteredWaproProducts.map((wp) => ({
      externalId: wp.id.toString(),
      name: wp.name,
      tax: Number.parseInt(wp.tax || ''),
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
