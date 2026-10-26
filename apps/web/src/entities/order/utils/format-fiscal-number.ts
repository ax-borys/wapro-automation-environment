export const formatFiscalNumber = (number: number): string => {
   const prefix = 'W';
   const value = String(number).padStart(6, '0');

   return prefix + value;
};
