import { productInputSchema, productSchema } from '@wae/types';
import * as v from 'valibot';

const syncableProductSchema = v.pick(productInputSchema, [
   'tax',
   'name',
   'stock',
   'imgSrc',
]);
const syncProductsInputSchema = v.array(syncableProductSchema);
const syncProductsReturnSchema = v.array(productSchema);

type SyncProductsInput = v.InferOutput<typeof syncProductsInputSchema>;
type SyncProductsReturn = v.InferOutput<typeof syncProductsReturnSchema>;

export async function syncProducts(
   productsInput: SyncProductsInput,
): Promise<SyncProductsReturn> {
   return [];
}
