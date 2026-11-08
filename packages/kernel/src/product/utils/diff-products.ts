import { Product, ProductInput } from '@wae/types';
import { assignKey } from '../../utils/assign-key';

export type DifferableProduct = Partial<ProductInput>;
export type ProductDifference = DifferableProduct;
export type DiffProductsResult = {
   difference: ProductDifference;
   isDifferent: boolean;
};

export function diffProducts(
   differableProduct: DifferableProduct,
   storedProduct: Product,
): DiffProductsResult {
   const diff: ProductDifference = {};

   for (const key of Object.keys(
      differableProduct,
   ) as (keyof DifferableProduct)[]) {
      const isEqual: boolean = differableProduct[key] === storedProduct[key];

      if (isEqual) continue;

      assignKey(diff, differableProduct, key);
   }

   return {
      isDifferent: !!Object.values(diff).length,
      difference: diff,
   };
}
