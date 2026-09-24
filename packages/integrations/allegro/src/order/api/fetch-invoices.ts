import { validationError } from '@wae/core';
import { allegroError } from '../../errors/api-errors';
import { store } from '../../store/store';
import * as v from 'valibot';

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
   const { userAgent } = store.getState();
   const response = await fetch(
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
   );

   if (!response.ok) {
      throw allegroError(
         `Failed to obtain invoices. Got status ${response.status}.`,
         'EXTERNAL_API_ERROR',
      );
   }

   const result = await response.json();

   const validatedResult = v.safeParse(apiResponseRawInvoicesSchema, result);

   if (!validatedResult.success) {
      throw validationError(
         'Invoices have been fetched successfully, but response schema is different. Probably, Allegro has been changed it recently.',
      );
   }

   return validatedResult.output;
}
