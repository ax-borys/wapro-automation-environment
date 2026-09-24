import { AppError, ErrorCode, externalApiError } from '@wae/core';
import { runtimeError } from '@wae/core';

export const allegroError = (
   msg: string,
   code: ErrorCode,
   cause?: unknown,
   details?: unknown,
) => externalApiError(msg, code, 'ALLEGRO', cause, details);

export const validationError = (msg: string, details?: unknown) =>
   allegroError(msg, 'VALIDATION', null, details);

export const authError = (
   msg: string,
   code?: ErrorCode & ('FORBIDDEN' | 'UNAUTHORIZED'),
) => allegroError(msg, code ?? 'AUTHENTICATION');

export const invalidDeviceCode = () =>
   authError(
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
