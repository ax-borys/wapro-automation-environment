import { businessRuleViolation } from '@wae/core';
import { Order } from '@wae/types';

export const emptyInput = (msg: string) => businessRuleViolation(msg);
export const orderDoesntExist = (orderId: Order['id']) =>
   businessRuleViolation(`Order with #id=${orderId} does not exist.`);
