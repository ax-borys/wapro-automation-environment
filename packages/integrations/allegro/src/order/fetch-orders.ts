import { externalApiError } from '@wae/core';
import { rawOrderSchema } from './schema';
import * as v from 'valibot';
import { allegroError, validationError } from '../errors/api-errors';

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
   const response = await fetch(
      `https://api.allegro.pl/order/checkout-forms?${queryParams.toString()}`,
      {
         headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.allegro.public.v1+json',
            'Content-Type': 'application/vnd.allegro.public.v1+json',
            'User-Agent': `${userAgent}`,
         },
      },
   );

   if (!response.ok) {
      throw allegroError(
         `Failed to obtain orders. Got status ${response.status}.`,
      );
   }

   const result = await response.json();

   const validatedResult = v.safeParse(apiResponseRawOrderSchema, result);

   if (!validatedResult.success) {
      throw validationError(
         'Orders have been fetched successfully, but response schema is different. Probably, Allegro has been changed it recently.',
      );
   }

   return validatedResult.output;
}
