import { db } from '../db';
import { productsTable } from '../db/schema';

export async function getProducts() {
   const result = await db.select().from(productsTable);

   return result;
}
