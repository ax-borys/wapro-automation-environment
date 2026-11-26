export function normalizeDateFields<
   T extends Record<string, any>,
   TKey extends keyof T,
>(obj: T, keys: TKey[]) {
   const result: Record<keyof T, any | Date> = { ...obj };

   for (const key of keys) {
      const date = new Date(obj[key]);

      result[key] = date;
   }

   return result as Omit<T, TKey> & Record<TKey, Date>;
}
