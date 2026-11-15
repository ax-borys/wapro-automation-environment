import { allegroJwtPayloadSchema } from './obtain-auth-tokens';
export type AllegroJwtPayloadSchema = typeof allegroJwtPayloadSchema;

const mockingServiceMode = Boolean(process.env.ALLEGRO_MOCKING_SERVICE_MODE);

export const obtainAuthTokens = mockingServiceMode
   ? (await import('./obtain-auth-tokens.mock')).obtainAuthTokens
   : (await import('./obtain-auth-tokens')).obtainAuthTokens;
