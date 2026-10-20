type Order = {
   receipt: any;
   invoice?: { status: 'RECORDED' | 'RECORD' | 'RECORDING' };
   preparedAt: Date;
};

const isRecorded = (order: Order) =>
   Boolean(order.receipt) || order.invoice?.status === 'RECORDED';

export const sortOrders = (a: Order, b: Order) => {
   const recordedDiff = Number(isRecorded(a)) - Number(isRecorded(b));

   if (recordedDiff !== 0) {
      return recordedDiff; // not recorded (0) first, recorded (1) last
   }

   return a.preparedAt.getTime() - b.preparedAt.getTime();
};
