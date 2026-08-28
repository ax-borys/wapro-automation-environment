import { ApiResponseRawOrder } from './types';

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
      throw response;
   }

   return await response.json();
}
