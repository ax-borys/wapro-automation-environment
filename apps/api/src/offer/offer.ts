import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { type CreateOfferInput } from '@wae/offer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from 'fs';

import type { Handler } from 'hono';
import type { ApiResponse } from '@wae/types';

export const createOfferHandler: Handler = async (c) => {
   const offer = await c.req.json<CreateOfferInput>();
};
