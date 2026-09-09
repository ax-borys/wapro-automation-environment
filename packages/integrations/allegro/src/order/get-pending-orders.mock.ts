import * as v from 'valibot';
import { orderValidationSchema } from './map-order';
type Order = v.InferOutput<typeof orderValidationSchema>;

export async function getPendingOrdersMock(): Promise<any[]> {
   return [{}];
}
