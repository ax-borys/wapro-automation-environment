export function normalizeDateFields<
   T extends Record<string, string>,
   TKey = keyof T,
>(obj: T, keys: TKey[]) {
   for (const key of keys) {
      const date = new Date(obj[key]);
   }
}
