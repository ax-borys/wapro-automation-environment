import { externalApiError } from '@wae/core';

export const invalidDeviceCode = () =>
   externalApiError(
      'Failed to fetch refresh token. Invalid device code. Provide refresh token or valid device code.',
   );
