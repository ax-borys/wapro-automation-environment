import { Offer } from '@wae/types';
import { normalizeText } from '../../utils/normalize-text';

type ComparableOffer = Pick<Offer, 'title' | 'imgSrc'>;

export function compareOffer(
   offerA: ComparableOffer,
   offerB: ComparableOffer,
): boolean {
   const isSimilar =
      offerA.imgSrc === offerB.imgSrc &&
      normalizeText(offerA.title) === normalizeText(offerB.title);

   return isSimilar;
}
