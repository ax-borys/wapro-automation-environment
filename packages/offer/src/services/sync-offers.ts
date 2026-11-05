import { offersTable } from '@wae/db';
import { invalidReference } from '@wae/error';
import {
   buildSrcExternalIdQueryCondition,
   compareOffer,
   mapBySrcExternalId,
   mapOffersById,
} from '@wae/kernel';
import { Offer, offerInputSchema, offerSchema, Tx } from '@wae/types';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';
import { createOffer } from './create-offer';
import { updateAndUnlinkItems } from './update-and-unlink-items';

const syncableOfferInputSchema = v.pick(offerSchema, [
   'imgSrc',
   'title',
   'externalId',
   'src',
]);

type SyncableOffer = v.InferOutput<typeof syncableOfferInputSchema>;

const syncOffersInputSchema = v.array(syncableOfferInputSchema);

type SyncOffersInput = v.InferOutput<typeof syncOffersInputSchema>;

type SyncOffersReturn = Offer[];

async function updateOfferData(
   tx: Tx,
   offerData: SyncableOffer,
): Promise<Offer> {
   const [updatedOffer] = await tx
      .update(offersTable)
      .set(offerData)
      .where(
         and(
            eq(offersTable.src, offerData.src),
            eq(offersTable.externalId, offerData.externalId),
         ),
      )
      .returning();

   return updatedOffer;
}

export async function syncOffers(
   tx: Tx,
   input: SyncOffersInput,
): Promise<SyncOffersReturn> {
   const condition = buildSrcExternalIdQueryCondition(input);

   const storedOffers = await tx.query.offersTable.findMany({
      where: condition,
   });

   const [storedOffersBySrcExternalId, mapKey] =
      mapBySrcExternalId(storedOffers);

   const updatedOffers: Offer[] = [];

   for (const offerInput of input) {
      const storedOffer = storedOffersBySrcExternalId.get(
         mapKey(offerInput.src, offerInput.externalId),
      );

      if (!storedOffer) {
         const createdOffer = await createOffer(tx, offerInput);

         updatedOffers.push(createdOffer);
      } else {
         const isSimilar = compareOffer(offerInput, storedOffer);

         if (!isSimilar) {
            const updatedOffer = await updateOfferData(tx, offerInput);

            await updateAndUnlinkItems(tx, {
               offerId: updatedOffer.id,
               items: [],
            });

            updatedOffers.push(updatedOffer);
         }
      }
   }

   return updatedOffers;
}
