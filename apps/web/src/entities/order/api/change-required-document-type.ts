import { client } from '@/lib/client';
import { InferRequestType } from 'hono/client';

type Input = InferRequestType<
   (typeof client.order)['required-document-type']['$put']
>['json'];

export async function changeRequiredDocumentType(input: Input) {
   console.log('Input: ', input);
   const response = await client.order['required-document-type']['$put']({
      json: input,
   });

   if (!response.ok) {
      const { error } = await response.json();

      throw error;
   }

   const { data } = await response.json();

   return data;
}
