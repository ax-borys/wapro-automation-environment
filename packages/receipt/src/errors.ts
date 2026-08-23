import { AppError, businessRuleViolation } from '@wae/core';

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

export const offerDoesntExist = (id: number) => {
   return businessRuleViolation(`Offer with id #${id} does not exist.`);
};

export const positionHasNoMatchedOffer = (
   id: string | number,
   title: string,
) => {
   return businessRuleViolation(
      `Receipt position with id #${id} and title "${title}" has no recorded matches.`,
   );
};
