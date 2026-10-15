'use client';

import { cn } from '@/lib/utils';
import { enableMapSet } from 'immer';
import React, { useEffect, useId, useRef } from 'react';
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
   ...props
}: React.ComponentProps<'div'> & { cacheKey: string }) {
   const [scroll, setScroll] = useScrollCache(cacheKey);
   const wrapperRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const handleScroll = () => {
         if (!wrapperRef.current) return;

         setScroll(wrapperRef.current.scrollTop);
      };

      if (!wrapperRef.current) return;

      wrapperRef.current.addEventListener('scroll', handleScroll, {
         passive: true,
      });

      return () =>
         wrapperRef.current?.removeEventListener('scroll', handleScroll);
   }, []);

   useEffect(() => {
      if (!wrapperRef.current) return;

      wrapperRef.current.scrollTop = scroll;
   }, []);

   return <div ref={wrapperRef} className={cn(className)} {...props} />;
}
