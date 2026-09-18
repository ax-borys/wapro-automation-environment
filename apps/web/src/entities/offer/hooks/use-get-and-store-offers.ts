import { useEffect } from 'react';
import { fetchAllOffersWithItems } from '../fetch-offers-with-items';
import { useOffersStore } from '../offer.store';
import { normilizeItems } from '../normilize';

export function useGetAndStoreOffers(cb?: () => void) {
   const { addMany } = useOffersStore();
   useEffect(() => {
      const promise = fetchAllOffersWithItems();
      promise.then((offers) => {
         addMany(
            offers.map((offer) => ({
               ...offer,
               items: normilizeItems(offer.items),
            })),
         );
         cb?.();
      });
   }, []);
}
