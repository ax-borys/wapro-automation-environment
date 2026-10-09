import React, { createContext, useContext } from 'react';

type HandlersContext = {
   onSave?: () => void;
   onCancel?: () => void;
   onOpen?: () => void;
};

const editDialogHandlersContext = createContext<HandlersContext>({});

export function EditDialogHandlersProvider({
   children,
   value,
   ...props
}: React.ProviderProps<HandlersContext>) {
   return (
      <editDialogHandlersContext.Provider value={value}>
         {children}
      </editDialogHandlersContext.Provider>
   );
}

export function useEditDialogHandlers(): [HandlersContext] {
   const handlers = useContext(editDialogHandlersContext);

   return [handlers];
}
