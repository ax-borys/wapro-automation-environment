import { db } from '@wae/db';

type Callback = Parameters<typeof db.transaction>[0];

export const tx = (callback: Callback) => db.transaction(callback);
