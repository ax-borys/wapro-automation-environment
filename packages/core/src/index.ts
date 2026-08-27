export default function distributeNumber(
   total: number,
   parts: number,
): number[] {
   const base = Math.floor(total / parts);

   const remainder = total % parts;

   const result = [0];

   for (let i = 0; i < parts; i++) {
      result[i] = base + (i < remainder ? 1 : 0);
   }

   return result;
}

export {
   forbidden,
   notFound,
   validationError,
   conflict,
   businessRuleViolation,
   externalApiError,
   AppError,
} from './app-error';
