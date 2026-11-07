import { db, offersTable } from '@wae/db';
import { syncOffers } from '../../services/sync-offers';
import { generateTestOffer, seedOffer } from '../helpers';
import { eq } from 'drizzle-orm';

describe('sync-offer.ts: syncOffers()', () => {
   it('should create new offer if it does not exist with provided externalId and src pair', async () => {
      const offerFixture = generateTestOffer();
      const [offer] = await db.transaction((tx) =>
         syncOffers(tx, [offerFixture]),
      );

      expect(offer).not.toBeNull();

      const [storedOffer] = await db
         .select()
         .from(offersTable)
         .where(eq(offersTable.id, offer.id));

      expect(storedOffer).not.toBeNull();
      expect(storedOffer).toMatchObject(offerFixture);
   });
   it("should renew offer's imgSrc and title", async () => {
      const offerFixture = generateTestOffer();
      const offer = await seedOffer(offerFixture);

      const title = 'New title provided.';
      const imgSrc = 'https://placeholder.com/198x198';

      const [renewedOffer] = await db.transaction((tx) =>
         syncOffers(tx, [{ ...offer, title, imgSrc }]),
      );

      expect(renewedOffer).toMatchObject({ title, imgSrc });
   });
   it('should do nothing if nothing is different', async () => {
      const offerFixture = generateTestOffer();
      const offer = await seedOffer(offerFixture);

      const result = await db.transaction((tx) => syncOffers(tx, [offer]));

      expect(result.length).toBe(0);

      const [storedOffer] = await db
         .select()
         .from(offersTable)
         .where(eq(offersTable.id, offer.id));

      expect(storedOffer).toMatchObject(offer);
   });
});
