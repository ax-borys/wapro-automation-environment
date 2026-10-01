import { store } from '../../store/store';
import * as v from 'valibot';
import { fetchWithValidation } from '../../core';
import { assertStore } from '../../assertions';

const rawInvoiceSchema = v.object({
   id: v.string(),
   invoiceNumber: v.nullable(v.string()),
   createdAt: v.string(),
   file: v.nullable(
      v.object({
         name: v.string(),
         uploadedAt: v.string(),
      }),
   ),
});

const apiResponseRawInvoicesSchema = v.object({
   orderMode: v.picklist(['UKRAINE_EXPORT', 'REGULAR']),
   invoices: v.array(rawInvoiceSchema),
   hasExternalInvoices: v.boolean(),
});

type ApiResponseRawInvoices = v.InferOutput<
   typeof apiResponseRawInvoicesSchema
>;

export async function fetchInvoices(
   accessToken: string,
   orderId: string,
): Promise<ApiResponseRawInvoices> {
   assertStore(store);

   const { userAgent } = store.getState();

   const result = await fetchWithValidation(
      apiResponseRawInvoicesSchema,
      v.any(),
      `https://api.allegro.pl/order/checkout-forms/${orderId}/invoices`,
      {
         headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.allegro.public.v1+json',
            'Content-Type': 'application/vnd.allegro.public.v1+json',
            'Accept-Language': 'en-US',
            'User-Agent': `${userAgent}`,
         },
      },
      'Failed to obtain invoices.',
   );

   return result;
}
