const mockingServiceMode = Boolean(process.env.ALLEGRO_MOCKING_SERVICE_MODE);

export const fetchOrders = mockingServiceMode
   ? (await import('./fetch-orders.mock')).fetchOrders
   : (await import('./fetch-orders')).fetchOrders;
