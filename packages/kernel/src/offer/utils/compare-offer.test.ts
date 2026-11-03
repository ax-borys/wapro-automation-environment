import { compareOffer } from './compare-offer';

describe('compareOffers', () => {
   it('compare similar offers', () => {
      expect(
         compareOffer(
            {
               title: 'Some kind of title',
               imgSrc: 'https://example.com/public/test.img',
            },
            {
               title: 'Some kind of title',
               imgSrc: 'https://example.com/public/test.img',
            },
         ),
      ).toBe(true);
   });

   it('compare with mismatched title case', () => {
      expect(
         compareOffer(
            {
               title: 'SomE kiNd oF TiTle   ',
               imgSrc: 'https://example.com/public/test.img',
            },
            {
               title: 'Some kind of title',
               imgSrc: 'https://example.com/public/test.img',
            },
         ),
      ).toBe(true);
   });

   it('compare with mismatched url', () => {
      expect(
         compareOffer(
            {
               title: 'Some kind of title',
               imgSrc: 'https://example.com/public/test2.img',
            },
            {
               title: 'Some kind of title',
               imgSrc: 'https://example.com/public/test.img',
            },
         ),
      ).toBe(false);
   });
});
