export { MOCK_OFFERS } from './fetch-offers.mock';
export type { QueryParams } from './fetch-offers';

const mockingServiceMode = Boolean(process.env.ALLEGRO_MOCKING_SERVICE_MODE);

export const fetchOffers = mockingServiceMode
   ? (await import('./fetch-offers.mock')).fetchOffers
   : (await import('./fetch-offers')).fetchOffers;
