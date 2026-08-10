import helloWorld from '@wae/wapro-mag-create-receipt';
import { health_check } from '../../../packages/db/src';

helloWorld();
await health_check();
