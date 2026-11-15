import type { QueryParams } from './fetch-offers';

type ApiResponseRawOffer = {
   offers: {
      id: string;
      name: string;
      primaryImage: {
         url: string;
      };
   }[];
   count: number;
   totalCount: number;
};

const MOCK_TOTAL_COUNT = 50;

export const MOCK_OFFERS: ApiResponseRawOffer['offers'] = Array.from(
   { length: MOCK_TOTAL_COUNT },
   (_, i) => ({
      id: String(10000000000 + i + 1),
      name: `Mock offer #${i + 1}`,
      primaryImage: {
         url: `https://placeholder.com/128x128`,
      },
   }),
);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchOffers(
   _accessToken: string,
   queryParams?: QueryParams,
): Promise<ApiResponseRawOffer> {
   await delay(300);

   let offers = MOCK_OFFERS;

   // Filter by specific offer IDs, if provided
   const ids = queryParams?.['offer.id'];
   if (ids && ids.length > 0) {
      offers = offers.filter((offer) => ids.includes(offer.id));
   }

   const totalCount = offers.length;

   // Pagination (Allegro defaults: limit 100, offset 0)
   const limit = queryParams?.limit ? Number(queryParams.limit) : 100;
   const offset = queryParams?.offset ? Number(queryParams.offset) : 0;
   const page = offers.slice(offset, offset + limit);

   return {
      offers: page,
      count: page.length,
      totalCount,
   };
}
