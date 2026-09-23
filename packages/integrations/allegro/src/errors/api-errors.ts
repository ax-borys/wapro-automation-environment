import { externalApiError } from '@wae/core';
import { runtimeError } from '@wae/core';

export const allegroError = (msg: string) =>
   externalApiError('ALLEGRO: ' + msg);

export const validationError = (msg: string) =>
   allegroError('VALIDATION: ' + msg);

export const authError = (msg: string) => allegroError('AUTH: ' + msg);

export const invalidDeviceCode = () =>
   allegroError(
      'Failed to fetch refresh token. Invalid device code. Provide refresh token or valid device code.',
   );

export const clientIdIsNotSet = () => runtimeError('Client ID is not set.');
export const clientSecretIsNotSet = () =>
   runtimeError('Client secret has not been provided.');
export const deviceIdIsNotSet = () => runtimeError('Device ID is not set.');
export const userAgentIsNotSet = () =>
   runtimeError('User-Agent is not provided.');
export const sellerIdIsNotSet = () =>
   runtimeError('Seller ID has not been provided.');
