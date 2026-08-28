import { store } from '../store/store';

type ApiResponseRawInvoices = {
   order_mode: 'UKRAINE_EXPORT' | 'REGULAR';
   invoices: RawInvoice;
   hasExternalInvoices: boolean;
};

type RawInvoice = {
   id: string;
   invoiceNumber: string;
   createdAt: string;
   file: {
      name: string;
      uploadedAt: string;
   };
};

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
      console.error(await response.text());
      throw response;
   }

   return (await response.json()) as ApiResponseRawInvoices;
}
