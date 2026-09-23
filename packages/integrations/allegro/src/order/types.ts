import { addressSchema, rawOrderSchema } from './schema';
import * as v from 'valibot';

export type Address = v.InferOutput<typeof addressSchema>;
export type RawOrder = v.InferOutput<typeof rawOrderSchema>;
