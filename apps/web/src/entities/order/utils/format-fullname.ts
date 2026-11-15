export const formatFullname = (
   firstName?: string | null,
   lastName?: string | null,
   companyName?: string | null,
): string => {
   if (firstName && lastName) return `${firstName} ${lastName}`;
   else if (companyName) return companyName;
   else return 'NAME WAS NOT PROVIDED';
};
