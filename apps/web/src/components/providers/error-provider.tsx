'use client';
import React, { createContext, useState } from 'react';
import {
   Dialog,
   DialogHeader,
   DialogTitle,
   DialogContent,
   DialogDescription,
} from '../ui/dialog';
import {
   ErrorModel,
   ErrorState,
   errorContext,
   setErrorContext,
} from '@/entities/error';

function ErrorDialog({
   error,
   onClose,
}: {
   error: ErrorModel | null;
   onClose?: () => void;
}) {
   return (
      <Dialog
         open={error ? true : false}
         onOpenChange={(open) => (!open ? onClose?.() : null)}
      >
         <DialogContent>
            <DialogHeader>
               <DialogTitle className="text-destructive">
                  Error occured: {error?.scope}
               </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2 text-destructive">
               Message:{' '}
               <p className="text-primary/80 bg-muted p-2 rounded-md">
                  {error?.message}
               </p>
            </div>
         </DialogContent>
      </Dialog>
   );
}

export function ErrorProvider({ children }: { children: React.ReactNode }) {
   const [error, setError] = useState<ErrorState>(null);

   return (
      <errorContext.Provider value={error}>
         <setErrorContext.Provider value={setError}>
            {children}
            <ErrorDialog error={error} onClose={() => setError(null)} />
         </setErrorContext.Provider>
      </errorContext.Provider>
   );
}
