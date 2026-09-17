type Order = { receipt: any; preparedAt: Date };

export const sortOrders = (a: Order, b: Order) => {
   if (a.receipt) {
      return 1;
   } else if (b.receipt) {
      return -1;
   }
   const preparedAtDiff = a.preparedAt.getTime() - b.preparedAt.getTime();

   return preparedAtDiff;
};
