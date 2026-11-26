type DateInput = string | number;

type DateKeys<T> = {
   [K in keyof T]-?: [NonNullable<T[K]>] extends [never]
      ? never
      : NonNullable<T[K]> extends DateInput
        ? K
        : never;
}[keyof T];

type ToDate<V> = V extends DateInput ? Date : V;

type NormalizedDates<T, TKey extends keyof T> = {
   [K in keyof T]: K extends TKey ? ToDate<T[K]> : T[K];
};

export function normalizeDateFields<
   T extends Record<string, any>,
   TKey extends DateKeys<T>,
>(obj: T, keys: TKey[]): NormalizedDates<T, TKey> {
   const result: Record<keyof T, unknown> = { ...obj };

   for (const key of keys) {
      const value = obj[key];

      result[key] =
         typeof value === 'string' || typeof value === 'number'
            ? new Date(value)
            : value;
   }

   return result as NormalizedDates<T, TKey>;
}
