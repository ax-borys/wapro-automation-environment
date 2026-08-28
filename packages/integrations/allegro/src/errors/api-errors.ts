import { externalApiError } from '@wae/core';
import { runtimeError } from '@wae/core';

export const invalidDeviceCode = () =>
   externalApiError(
      'Failed to fetch refresh token. Invalid device code. Provide refresh token or valid device code.',
   );

export const clientIdIsNotSet = () => runtimeError('Client ID is not set.');
export const clientSecretIsNotSet = () =>
   runtimeError('Client secret has not been provided.');
export const deviceIdIsNotSet = () => runtimeError('Device ID is not set.');
export const userAgentIsNotSet = () =>
   runtimeError('User-Agent is not provided.');
