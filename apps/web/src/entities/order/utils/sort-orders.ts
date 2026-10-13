type Order = {
   receipt: any;
   invoice?: { status: 'RECORDED' | 'RECORD' | 'RECORDING' };
   preparedAt: Date;
};

export const sortOrders = (a: Order, b: Order) => {
   if (a.receipt || a.invoice?.status === 'RECORDED') {
      return 1;
   } else if (b.receipt || b.invoice?.status === 'RECORDED') {
      return -1;
   }
   const preparedAtDiff = a.preparedAt.getTime() - b.preparedAt.getTime();

   return preparedAtDiff;
};
