export type ApiError = {
   code: string;
   message: string;
};

export type ApiResponse<T> = T extends ApiError
   ? { data: null; error: ApiError }
   : {
        data: T;
        error: null;
     };
