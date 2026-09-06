import { addOrderInputSchema } from '../services/add-orders';
import * as v from 'valibot';
import { and, eq, or } from 'drizzle-orm';
import { Order } from '@wae/types';

export const filterOrdersInputSchema = v.array(
   v.pick(addOrderInputSchema, ['src', 'externalId']),
);

type FilterOrdersInput = v.InferInput<typeof filterOrdersInputSchema>;
type FilterOrdersReturn = FilterOrdersInput;

type SrcExternalId = Record<string, any> & { src: string; externalId: string };

type keySrcExternalId = (keySrc: string, keyExternalId: string) => string;

function mapBySrcExternalId<T extends SrcExternalId>(
   values: T[],
): [Map<string, T>, keySrcExternalId] {
   const key = (
      keySrc: SrcExternalId['src'],
      keyExternalId: SrcExternalId['externalId'],
   ) => keySrc + keyExternalId;

   return [
      new Map(values.map((value) => [key(value.src, value.externalId), value])),
      key,
   ];
}

export function buildSrcExternalIdCondition<T extends SrcExternalId>(
   rows: T[],
   columnMap: {
      src: any;
      externalId: any;
   },
) {
   if (!rows.length) return undefined;

   return or(
      ...rows.map((row) =>
         and(
            eq(columnMap.src, row.src),
            eq(columnMap.externalId, row.externalId),
         ),
      ),
   );
}

export function buildSrcExternalIdQueryCondition<T extends SrcExternalId>(
   rows: T[],
) {
   const condition: { OR: SrcExternalId[] } = { OR: [] };

   rows.forEach((row) => {
      condition.OR.push({ src: row.src, externalId: row.externalId });
   });

   return condition;
}

export function filterNewOrdersBySrcExternalId<T extends SrcExternalId>(
   ordersInput: T[],
   existingOrders: Pick<Order, 'src' | 'externalId'>[],
): T[] {
   const [mappedExistingOrders, key] = mapBySrcExternalId(existingOrders);

   const nonExistingOrders = ordersInput.filter((orderInput) =>
      mappedExistingOrders.get(key(orderInput.src, orderInput.externalId))
         ? false
         : true,
   );

   return nonExistingOrders;
}
