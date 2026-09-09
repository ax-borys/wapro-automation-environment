import { deliveriesTable } from '@wae/db';
import { createObtainEntities } from '@wae/kernel';
import { deliveryInputSchema, deliverySchema } from '@wae/types';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import { compareDeliveries } from '../utils/compare-deliveries';

export const obtainDeliveryInputSchema = v.omit(deliveryInputSchema, ['id']);
export const obtainDeliveryReturnSchema = deliverySchema;

type ObtainDeliveryOutput = v.InferOutput<typeof obtainDeliveryInputSchema>;
type ObtainDeliveryReturnOutput = v.InferOutput<
   typeof obtainDeliveryReturnSchema
>;

export const obtainDeliveries: (
   deliveriesInput: ObtainDeliveryOutput[],
) => Promise<ObtainDeliveryReturnOutput[]> = createObtainEntities({
   table: deliveriesTable,
   equal: (table, delivery) => [eq(table.addressId, delivery.addressId)],
   schema: obtainDeliveryInputSchema,
   returnSchema: obtainDeliveryReturnSchema,
   compare: compareDeliveries,
   transform: (delivery, deliveryInput) => ({
      ...delivery,
      clientTag: deliveryInput.clientTag || null,
   }),
});
