import { OffersDataTable } from '@/components/widgets/offers-data-table';
import { ProductModel } from '@/entities/offer';
import { fetchAllOffersWithItems } from '@/entities/offer/fetch-offers-with-items';

export default async function OffersPage() {
   const offers = await fetchAllOffersWithItems();

   const offersInput = offers.map((offer) => {
      const items: Record<ProductModel['id'], ProductModel> = {};
      offer.items.forEach((i) => (items[i.id] = i));
      return { ...offer, active: true, items };
   });

   return (
      <div className="flex flex-col min-h-0 h-full">
         <OffersDataTable initialData={offersInput} />
      </div>
   );
}
