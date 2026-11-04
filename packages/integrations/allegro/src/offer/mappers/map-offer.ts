import { CreateOfferInput } from '@wae/offer';
import * as v from 'valibot';
import { rawOfferSchema } from '../offer';
import { originalImgSrcTos128b } from '../../utils/originalImgSrcTos128b';

type RawOffer = v.InferOutput<typeof rawOfferSchema>;
export type Offer = CreateOfferInput;

export function mapOffer(offer: RawOffer): Offer {
   return {
      src: 'allegro',
      title: offer.name,
      imgSrc: originalImgSrcTos128b(offer.primaryImage.url),
      externalId: offer.id,
   };
}
