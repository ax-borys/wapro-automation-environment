export type ApiError = {
   code: string;
   message: string;
};

export type ApiResponse<T> =
   | {
        data: T;
        error: null;
     }
   | { data: null; error: ApiError };
