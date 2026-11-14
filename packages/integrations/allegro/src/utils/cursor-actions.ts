import { parseSyncCursor, serializeSyncCursor, SyncCursor } from '../core';
import { store, SyncCursors } from '../store/store';

export function saveCursor(name: keyof SyncCursors, cursor: SyncCursor) {
   const { setCursor } = store.getState();

   setCursor(name, serializeSyncCursor(cursor));
}

export function fetchCursor(name: keyof SyncCursors): SyncCursor | null {
   const { cursors } = store.getState();

   return cursors ? parseSyncCursor(cursors[name]) : null;
}
