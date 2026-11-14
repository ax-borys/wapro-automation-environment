export type SyncCursor = {
   lastSyncUpdatedAt: Date;
};

export type SerializedSyncCursor = Record<keyof SyncCursor, string>;

export const serializeSyncCursor = (
   cursor: SyncCursor,
): SerializedSyncCursor => ({
   lastSyncUpdatedAt: cursor.lastSyncUpdatedAt.toISOString(),
});

export const parseSyncCursor = (
   serializedCursor: SerializedSyncCursor,
): SyncCursor => ({
   lastSyncUpdatedAt: new Date(serializedCursor.lastSyncUpdatedAt),
});
