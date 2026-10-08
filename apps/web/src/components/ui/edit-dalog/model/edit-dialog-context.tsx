import React, { createContext, useContext, useState } from 'react';

type HandlersContext = {
   onSave?: () => void;
   onCancel?: () => void;
   onOpen?: () => void;
};

const editDialogHandlersContext = createContext<HandlersContext>({});
const editDialogHandlersSetterContext = createContext<React.Dispatch<
   React.SetStateAction<HandlersContext>
> | null>(null);

export function EditDialogHandlersProvider({
   children,
   value,
   ...props
}: React.ProviderProps<HandlersContext>) {
   const [handlers, setHandlers] = useState<HandlersContext>(value);

   return (
      <editDialogHandlersContext.Provider value={handlers}>
         <editDialogHandlersSetterContext.Provider value={setHandlers}>
            {children}
         </editDialogHandlersSetterContext.Provider>
      </editDialogHandlersContext.Provider>
   );
}

export function useEditDialogHandlers(): [
   HandlersContext,
   React.Dispatch<React.SetStateAction<HandlersContext>>,
] {
   const handlers = useContext(editDialogHandlersContext);
   const setHandlers = useContext(editDialogHandlersSetterContext);

   if (!setHandlers) {
      throw new Error(
         'useEditDialogHandlers must be called inside EditDialogProvider.',
      );
   }

   return [handlers, setHandlers];
}
