import { deliveryInputSchema, deliverySchema } from '@wae/types';
import * as v from 'valibot';

type Delivery = v.InferOutput<typeof deliverySchema>;
type DeliveryInput = v.InferOutput<typeof deliveryInputSchema>;

export function compareDeliveries(
   delivery1: Delivery | DeliveryInput,
   delivery2: Delivery | DeliveryInput,
) {
   return (
      delivery1.pointId === delivery2.pointId &&
      delivery1.addressId === delivery2.addressId
   );
}
