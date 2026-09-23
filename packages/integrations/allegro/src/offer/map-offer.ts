import { CreateOfferInput } from '@wae/offer';
import * as v from 'valibot';
import { rawOfferSchema } from './offer';

type RawOffer = v.InferOutput<typeof rawOfferSchema>;

export function mapOffer(offer: RawOffer): CreateOfferInput {
   return {
      src: 'allegro',
      title: offer.name,
      imgSrc: offer.primaryImage.url,
      externalId: offer.id,
   };
}
