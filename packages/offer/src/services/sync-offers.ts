import { offersTable } from '@wae/db';
import {
   buildSrcExternalIdQueryCondition,
   compareOffer,
   mapBySrcExternalId,
} from '@wae/kernel';
import { Offer, offerSchema, Tx } from '@wae/types';
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

const syncOffersInputSchema = v.pipe(v.array(syncableOfferInputSchema));

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
   if (!input.length) return [];

   const condition = buildSrcExternalIdQueryCondition(input);

   const storedOffers = await tx.query.offersTable.findMany({
      where: condition,
   });

   const [storedOffersBySrcExternalId, mapKey] =
      mapBySrcExternalId(storedOffers);

   const upsertedOffers: Offer[] = [];

   for (const offerInput of input) {
      const storedOffer = storedOffersBySrcExternalId.get(
         mapKey(offerInput.src, offerInput.externalId),
      );

      if (!storedOffer) {
         const createdOffer = await createOffer(tx, offerInput);

         upsertedOffers.push(createdOffer);
      } else {
         const isSimilar = compareOffer(offerInput, storedOffer);

         if (!isSimilar) {
            const updatedOffer = await updateOfferData(tx, offerInput);

            await updateAndUnlinkItems(tx, {
               offerId: updatedOffer.id,
               items: [],
            });

            upsertedOffers.push(updatedOffer);
         }
      }
   }

   return upsertedOffers;
}
