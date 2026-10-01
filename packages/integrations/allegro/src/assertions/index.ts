import { errorOccured } from '../error';
import { AppStore } from '../store/store';

export function assertStore(store: AppStore | null): asserts store is AppStore {
   if (!store) {
      throw errorOccured('INTERNAL', 'Store is not provided.');
   }
}
