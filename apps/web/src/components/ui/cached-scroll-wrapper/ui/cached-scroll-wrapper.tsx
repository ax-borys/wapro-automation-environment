'use client';

import { cn } from '@/lib/utils';
import { enableMapSet } from 'immer';
import React, { useEffect, useId, useLayoutEffect, useRef } from 'react';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

enableMapSet();

type ScrollStore = {
   scrollPositions: Map<any, number>;
   getPosition: (key: any) => number | undefined;
   setPosition: (key: any, value: number) => void;
};

export const useScrollStore = create<ScrollStore>()(
   immer((set, get) => ({
      scrollPositions: new Map(),
      getPosition: (key) => get().scrollPositions.get(key),
      setPosition: (key, value) =>
         set((draft) => {
            draft.scrollPositions.set(key, value);
         }),
   })),
);

export function useScrollCache(
   cacheKey: string,
   defaultScrollPosition: number = 0,
): [number, (value: number) => void] {
   const key = cacheKey;
   const scrollPosition = useScrollStore((s) => s.scrollPositions.get(key));
   const setScrollPosition = useScrollStore((s) => s.setPosition).bind(
      null,
      key,
   );

   useEffect(() => {
      if (scrollPosition === undefined) {
         setScrollPosition(defaultScrollPosition);
      }
   }, []);

   return [scrollPosition ?? defaultScrollPosition, setScrollPosition];
}

export function CachedScrollWrapper({
   className,
   cacheKey,
   onScroll,
   ...props
}: React.ComponentProps<'div'> & { cacheKey: string }) {
   const wrapperRef = useRef<HTMLDivElement>(null);

   // Restore once per key, before paint. Read imperatively so we don't subscribe.
   useLayoutEffect(() => {
      const el = wrapperRef.current;
      if (!el) return;
      el.scrollTop = useScrollStore.getState().getPosition(cacheKey) ?? 0;
   }, [cacheKey]);

   return (
      <div
         {...props}
         ref={wrapperRef}
         className={cn(className)}
         onScroll={(e) => {
            useScrollStore
               .getState()
               .setPosition(cacheKey, e.currentTarget.scrollTop);
            onScroll?.(e);
         }}
      />
   );
}
