class RuntimeError extends Error {
   details?: string[];

   constructor(msg: string, details?: string[]) {
      super(msg);
      this.name = 'RUNTIME_ERROR';
      this.details = details;
   }
}

export const runtimeError = (msg: string, details?: string[]) =>
   new RuntimeError(msg, details);
