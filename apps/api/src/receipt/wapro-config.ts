import { runtimeError } from '@wae/core';
import { WaproConfig } from '@wae/types';

if (!process.env.WAPRO_COMPANY_ID) {
   throw runtimeError('WAPRO_COMPANY_ID is not provided.');
} else if (isNaN(Number(process.env.WAPRO_COMPANY_ID))) {
   throw runtimeError('Failed to parse number from WAPRO_COMPANY_ID.');
}

if (!process.env.WAPRO_CASH_REGISTER_ID) {
   throw runtimeError('WAPRO_CASH_REGISTER_ID is not provided.');
} else if (isNaN(Number(process.env.WAPRO_COMPANY_ID))) {
   throw runtimeError('Failed to parse number from WAPRO_CASH_REGISTER_ID.');
}

if (!process.env.WAPRO_USER_ID) {
   throw runtimeError('WAPRO_USER_ID is not provided.');
} else if (isNaN(Number(process.env.WAPRO_COMPANY_ID))) {
   throw runtimeError('Failed to parse number from WAPRO_USER_ID.');
}

if (!process.env.WAPRO_COUNTER_PARTY_ID) {
   throw runtimeError('WAPRO_COUNTER_PARTY_ID is not provided.');
} else if (isNaN(Number(process.env.WAPRO_COMPANY_ID))) {
   throw runtimeError('Failed to parse number from WAPRO_COUNTER_PARTY_ID.');
}

if (!process.env.WAPRO_STOCK_ID) {
   throw runtimeError('WAPRO_STOCK_ID is not provided.');
} else if (isNaN(Number(process.env.WAPRO_COMPANY_ID))) {
   throw runtimeError('Failed to parse number from WAPRO_STOCK_ID.');
}

export const waproConfig: WaproConfig = {
   companyId: Number(process.env.WAPRO_COMPANY_ID),
   cashRegisterId: Number(process.env.WAPRO_CASH_REGISTER_ID),
   userId: Number(process.env.WAPRO_USER_ID),
   counterPartyId: Number(process.env.WAPRO_COUNTER_PARTY_ID),
   stockId: Number(process.env.WAPRO_STOCK_ID),
};
