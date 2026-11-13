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

type Options = {
   pagesLimit?: number;
   pageSize?: number;
   sort?:
      | 'updatedAt'
      | '-updatedAt'
      | 'lineItems.boughtAt'
      | '-lineItems.boughtAt';
   updatedAtGte?: Date;
   updatedAtLte?: Date;
};

export async function fetchOrders(
   accessToken: string,
   userAgent: string,
   options?: Options,
): Promise<ApiResponseRawOrder> {
   const allOrders: ApiResponseRawOrder['checkoutForms'] = [];
   let totalCount = 0;

   const pagesLimit = options?.pagesLimit ?? Infinity;
   const pageSize = options?.pageSize ?? 100;

   while (allOrders.length < pagesLimit * pageSize) {
      const limit = pageSize;

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
