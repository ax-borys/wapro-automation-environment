import { client } from '@/lib/client';
import { UpdateAndUnlinkItemsInput } from '@wae/offer';

export async function causeUpdateAndUlinkItems(
   input: UpdateAndUnlinkItemsInput,
) {
   const response = await client.offer['update-and-unlink-items-v2'].$post({
      json: input,
   });

   if (!response.ok) {
      const result = await response.json();
      throw result.error;
   }

   const result = await response.json();
   return result.data;
}
