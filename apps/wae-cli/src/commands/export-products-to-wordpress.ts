import * as wapro from '@wae/wapro';
import * as csv from 'csv/sync';

type WoocommercCollumn = {
   ID: number;
   Type: string;
   Name: string;
   Published: 1 | 0 | -1;
   Description: string;
   'Tax status': 'taxable';
   'In stock': 1 | 0;
   Stock: number;
};

export async function exportProductsToWordpress() {
   const products = await wapro.getProducts();
   const data: WoocommercCollumn[] = products.map((product) => ({
      ID: product.id,
      Type: 'simple',
      'In stock': product.stock > 0 ? 1 : 0,
      Description: product.name,
      'Tax status': 'taxable',
      Stock: product.stock,
      Published: -1,
      Name: product.name,
   }));

   const output = csv.stringify(data, { header: true });

   return output;
}
