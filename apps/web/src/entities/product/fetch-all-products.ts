import { client } from '@/lib/client';

export async function fetchAllProducts() {
   const response = await client['get-all-products'].$get();

   if (!response.ok) {
      const result = await response.json();
      throw result.error;
   }

   const result = await response.json();
   return result.data;
}
