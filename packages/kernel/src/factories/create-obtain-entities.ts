import { db } from '@wae/db';
import { and, InferInsertModel, InferSelectModel, or, SQL } from 'drizzle-orm';
import { SQLiteTable, TableConfig } from 'drizzle-orm/sqlite-core';
import {
   createInsertSchema,
   CreateSelectSchema,
   createSelectSchema,
} from 'drizzle-orm/valibot';
import * as v from 'valibot';

type Table = SQLiteTable<TableConfig>;
type Entity<S extends v.GenericSchema<unknown, unknown>> = v.InferOutput<S>;
type Input<S extends v.GenericSchema<unknown, unknown>> = v.InferOutput<S>;

export function createObtainEntities<
   T extends Table,
   TSchema extends v.GenericSchema<unknown, unknown>,
   TReturnSchema extends v.GenericSchema<unknown, unknown>,
>({
   table,
   compare,
   transform,
   equal,
   schema,
   returnSchema,
}: {
   table: T;
   equal: (table: T, value: Input<TSchema>) => SQL[] | SQL | undefined;
   compare: (
      input1: Input<TSchema> | Entity<TReturnSchema>,
      input2: Input<TSchema> | Entity<TReturnSchema>,
   ) => boolean;
   schema: TSchema;
   returnSchema: TReturnSchema;
   transform?: (
      entity: Entity<TReturnSchema>,
      entityInput: Input<TSchema>,
   ) => Entity<TReturnSchema>;
}): (input: Input<TSchema>[]) => Promise<v.InferOutput<TReturnSchema>[]> {
   return async (input) => {
      const condition = or(
         ...input.map((row) => {
            const equation = equal(table, row);

            if (equation instanceof Array) {
               return and(...equation);
            }

            return and(equation);
         }),
      );

      const existingEntities: Entity<TReturnSchema>[] = await db
         .select()
         .from(table)
         .where(condition);

      const nonExistingEntitiesInput = input.filter((entityInput) => {
         const existingEntity = existingEntities.find((entity) =>
            compare(entityInput, entity),
         );

         return !existingEntity;
      });

      const uniqueNonExistingEntitiesInput = nonExistingEntitiesInput.filter(
         (entityInput, i, arr) => {
            const existingEntity = arr
               .slice(0, i)
               .find((entityInput2) => compare(entityInput, entityInput2));

            return !existingEntity;
         },
      );

      const createdEntities: Entity<TReturnSchema>[] = (await db
         .insert(table)
         .values(uniqueNonExistingEntitiesInput as InferInsertModel<T>)
         .returning()) as Entity<TReturnSchema>[];

      const mappedEntities = input.map((entityInput) => {
         const entity = [...createdEntities, ...existingEntities].find(
            (entity) => compare(entity, entityInput),
         );

         if (!entity) throw new Error('Failed to obtain entity.');

         return typeof transform === 'function'
            ? transform(entity, entityInput)
            : entity;
      });

      const validatedEntities = schema
         ? v.parse(v.array(schema), mappedEntities)
         : mappedEntities;

      return validatedEntities;
   };
}
