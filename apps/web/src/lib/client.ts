import { hc } from 'hono/client';
import { type AppType } from '@wae/api-types';
export const client = hc<AppType>('http://localhost:8082/');
