import { CreateOfferInput } from '@wae/offer';
import { RawOffer } from './offer';

export function mapOffer(offer: RawOffer): CreateOfferInput {
   return {
      src: 'allegro',
      title: offer.name,
      imgSrc: offer.primaryImage.url,
      externalId: offer.id,
   };
}
