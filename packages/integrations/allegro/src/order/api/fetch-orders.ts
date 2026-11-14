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
   'fulfillment.status'?: 'NEW' | 'PROCESSING' | 'SENT';
   limit: string;
   offset: string;
   status?: 'READY_FOR_PROCESSING';
   sort?:
      | 'updatedAt'
      | '-updatedAt'
      | 'lineItems.boughtAt'
      | '-lineItems.boughtAt';
   'updatedAt.lte'?: string;
   'updatedAt.gte'?: string;
};

type FetchOrdersOptions = {
   pagesLimit?: number;
   pageSize?: number;
   sort?: QueryParams['sort'];
   updatedAtGte?: Date;
   updatedAtLte?: Date;
   status?: QueryParams['status'];
};

type AuthOptions = {
   userAgent: string;
   accessToken: string;
};

export async function fetchOrders(
   auth: AuthOptions,
   options?: FetchOrdersOptions,
): Promise<ApiResponseRawOrder> {
   const allOrders: ApiResponseRawOrder['checkoutForms'] = [];
   let totalCount = 0;

   const pagesLimit = options?.pagesLimit ?? Infinity;
   const pageSize = options?.pageSize ?? 100;

   while (allOrders.length < pagesLimit * pageSize) {
      const params: QueryParams = {
         limit: String(pageSize),
         offset: String(allOrders.length),
         ...(options?.sort && { sort: options.sort }),
         ...(options?.updatedAtGte && {
            'updatedAt.gte': options.updatedAtGte.toISOString(),
         }),
         ...(options?.updatedAtLte && {
            'updatedAt.lte': options.updatedAtLte.toISOString(),
         }),
         ...(options?.status && {
            status: options.status,
         }),
      };

      const queryParams = new URLSearchParams(params);

      const page = await fetchWithValidation(
         apiResponseRawOrderSchema,
         v.any(),
         `https://api.allegro.pl/order/checkout-forms?${queryParams.toString()}`,
         {
            headers: {
               Authorization: `Bearer ${auth.accessToken}`,
               Accept: 'application/vnd.allegro.public.v1+json',
               'Content-Type': 'application/vnd.allegro.public.v1+json',
               'User-Agent': `${auth.userAgent}`,
            },
         },
         'Failed to obtain orders.',
      );

      allOrders.push(...page.checkoutForms);
      totalCount = page.totalCount;

      if (
         page.checkoutForms.length < pageSize ||
         allOrders.length >= totalCount
      ) {
         break;
      }
   }

   return {
      checkoutForms: allOrders,
      count: allOrders.length,
      totalCount,
   };
}
