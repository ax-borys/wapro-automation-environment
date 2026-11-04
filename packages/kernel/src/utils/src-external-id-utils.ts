import { and, eq, or } from 'drizzle-orm';

export type SrcExternalId = Record<string, any> & {
   src: string;
   externalId: string;
};

export type keySrcExternalId = (
   keySrc: string,
   keyExternalId: string,
) => string;

export function mapBySrcExternalId<T extends SrcExternalId>(
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
