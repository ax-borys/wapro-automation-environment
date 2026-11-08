export function assignKey<T, K extends keyof T>(
   target: T,
   source: T,
   key: K,
): T {
   target[key] = source[key];
   return target;
}
