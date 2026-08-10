import { db } from '../../db/src/db';

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
