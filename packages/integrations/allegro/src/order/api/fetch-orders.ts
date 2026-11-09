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
   limit: string;
   offset: string;
};

const ORDERS_TO_FETCH = 300;
const MAX_PAGE_SIZE = 100; // Allegro's maximum page size

export async function fetchOrders(
   accessToken: string,
   userAgent: string,
): Promise<ApiResponseRawOrder> {
   const allOrders: ApiResponseRawOrder['checkoutForms'] = [];
   let totalCount = 0;

   while (allOrders.length < ORDERS_TO_FETCH) {
      const limit = Math.min(MAX_PAGE_SIZE, ORDERS_TO_FETCH - allOrders.length);

      const queryParams = new URLSearchParams({
         'fulfillment.status': 'SENT',
         limit: String(limit),
         offset: String(allOrders.length),
      } satisfies QueryParams);

      const page = await fetchWithValidation(
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

      allOrders.push(...page.checkoutForms);
      totalCount = page.totalCount;

      // Stop if the page was short (no more orders) or we've reached everything available
      if (page.checkoutForms.length < limit || allOrders.length >= totalCount) {
         break;
      }
   }

   return {
      checkoutForms: allOrders,
      count: allOrders.length,
      totalCount,
   };
}
