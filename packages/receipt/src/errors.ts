import {
   BaseError,
   ErrorCode,
   UpstreamError,
   AppError,
   businessRuleViolation,
} from '@wae/error';
import { WaproError } from '@wae/wapro';

export const errorOccured = (
   code: ErrorCode,
   message: string,
   cause?: BaseError,
   details?: unknown,
) => new AppError(code, message, cause, details);

export const waproErrorOccured = <TDetails = unknown>(
   code: ErrorCode,
   message: string,
   cause?: BaseError,
   details?: TDetails,
) => new WaproError<TDetails>(code, message, cause, details);

export const unsupportedPaymentMethod = (method: string) => {
   return businessRuleViolation(`Unsuported payment method: ${method}`);
};

export const unmappedOfferId = (offerId: string) => {
   return businessRuleViolation(
      `Offer with id #${offerId} is not mapped with erp store`,
   );
};

export const wrongCalculation = (total: number, calculatedTotal: number) => {
   return businessRuleViolation(
      `Total price ${total} from an input and total price ${calculatedTotal} in a receipt ARE NOT equal.`,
   );
};

export const positionHasNoMatchedOffer = (
   id: string | number,
   title: string,
) => {
   return businessRuleViolation(
      `Receipt position with id #${id} and title "${title}" has no recorded matches.`,
   );
};

export const positionWasNotInitialized = (orderId: number, offerId: number) =>
   businessRuleViolation(
      `Position with offerId=${offerId} has not been initialized for order with id=${orderId}.`,
   );
