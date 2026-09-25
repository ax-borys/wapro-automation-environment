import { createContext } from 'react';
import * as v from 'valibot';

export const errorModelSchema = v.object({
   message: v.string(),
   scope: v.string(),
});

export type ErrorModel = v.InferOutput<typeof errorModelSchema>;

export type ErrorState = ErrorModel | null;

export const errorContext = createContext<ErrorState>(null);
export const setErrorContext = createContext<React.Dispatch<
   React.SetStateAction<ErrorState>
> | null>(null);
