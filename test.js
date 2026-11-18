() => {
   async function obtainIds() {
      const response = await fetch(
         'http://192.168.1.222:8082/order/orders/fulfilled',
         {
            method: 'POST',
         },
      );

      if (!response.ok) {
         const { error } = await response.json();

         throw error;
      }

      const { data } = await response.json();

      return data.map((order) => order.externalId);
   }

   async function setExternalInvoices(orderId, value = true) {
      const res = await fetch(
         `https://edge.salescenter.allegro.com/order/checkout-forms/${orderId}/invoices`,
         {
            method: 'PUT',
            credentials: 'include', // sends your session cookies
            headers: {
               Accept: 'application/vnd.allegro.internal.v1+json',
               'Content-Type': 'application/vnd.allegro.internal.v1+json',
               'Accept-Language': 'pl-PL',
               'x-client-id': 'sc-31568',
               'X-Representative-Of': '105077680',
            },
            body: JSON.stringify({ hasExternalInvoices: value }),
         },
      );

      if (!res.ok) {
         throw new Error(
            `Failed for ${orderId}: ${res.status} ${await res.text()}`,
         );
      }

      // The response may have an empty body
      const text = await res.text();
      return text ? JSON.parse(text) : { ok: true };
   }

   const wait = (delay = 1000) => new Promise((res) => setTimeout(res, delay));

   async function main() {
      const orderIds = await obtainIds();
      const totalCount = orderIds.length;
      let count = 0;

      for (const externalId of orderIds) {
         await setExternalInvoices(externalId);

         count++;

         console.log('Done', `${(100 / totalCount) * count}%/100%`);

         await wait();
      }
   }

   main();
};
