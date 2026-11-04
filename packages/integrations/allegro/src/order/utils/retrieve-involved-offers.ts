import { Offer } from '../../offer';
import { Order } from '../mappers/map-order';

type OfferData = Pick<Offer, 'externalId' | 'title' | 'imgSrc' | 'src'>;

export function retrieveInvolvedOffers(orders: Order[]): OfferData[] {
   const offers: OfferData[] = orders.flatMap((order) =>
      order.positions.flatMap(
         (position): OfferData => ({
            externalId: position.offer.externalId,
            title: position.title,
            imgSrc: position.imgSrc,
            src: position.offer.src,
         }),
      ),
   );

   const uniqueOffersMap = new Map(
      offers.map((offer) => [offer.externalId, offer]),
   );

   return [...uniqueOffersMap.values()];
}
