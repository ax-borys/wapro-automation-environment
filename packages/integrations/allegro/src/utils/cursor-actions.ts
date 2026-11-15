import { parseSyncCursor, serializeSyncCursor, SyncCursor } from '../core';
import { store, SyncCursors } from '../store/store';

export function saveCursor(name: keyof SyncCursors, cursor: SyncCursor) {
   const { setCursor } = store.getState();

   setCursor(name, serializeSyncCursor(cursor));
}

export function fetchCursor(name: keyof SyncCursors): SyncCursor {
   const { cursors } = store.getState();

   return parseSyncCursor(cursors[name]);
}
