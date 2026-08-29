import { db, productsTable } from '@wae/db';
import { Product } from '../schemas';

export async function getAllProducts(): Promise<Product[]> {
   const products = await db.select().from(productsTable);

   return products;
}
