import { useContext } from 'react';
import { errorContext, ErrorModel, setErrorContext } from '../error-context';

export function useError() {
   const error = useContext(errorContext);
   const setError = useContext(setErrorContext);

   const raiseError = (error: ErrorModel) => {
      setError?.(error);
   };

   const clearError = () => {
      setError?.(null);
   };

   return { error, raiseError, clearError };
}
