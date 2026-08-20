export function toWaproDate(date = new Date()) {
   const sqlEpoch = Date.UTC(1900, 0, 1);

   const dateOnlyUtc = Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
   );

   const daysSinceSqlEpoch = (dateOnlyUtc - sqlEpoch) / 86400000;
   return Math.round(daysSinceSqlEpoch) + 36163;
}
