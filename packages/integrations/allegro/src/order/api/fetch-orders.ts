import { rawOrderSchema } from '../schema';
import * as v from 'valibot';
import { fetchWithValidation } from '../../core';

const apiResponseRawOrderSchema = v.object({
   checkoutForms: v.array(rawOrderSchema),
   count: v.number(),
   totalCount: v.number(),
});

type ApiResponseRawOrder = v.InferOutput<typeof apiResponseRawOrderSchema>;

type QueryParams = {
   'fulfillment.status': 'NEW' | 'PROCESSING' | 'SENT';
};

export async function fetchOrders(
   accessToken: string,
   userAgent: string,
): Promise<ApiResponseRawOrder> {
   const queryParams = new URLSearchParams({
      'fulfillment.status': 'SENT',
   } as QueryParams);
   const result = await fetchWithValidation(
      apiResponseRawOrderSchema,
      v.any(),
      `https://api.allegro.pl/order/checkout-forms?${queryParams.toString()}`,
      {
         headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.allegro.public.v1+json',
            'Content-Type': 'application/vnd.allegro.public.v1+json',
            'User-Agent': `${userAgent}`,
         },
      },
      'Failed to obtain orders.',
   );

   return result;
}
