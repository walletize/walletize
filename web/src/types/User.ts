import { Currency } from './Currency';

export interface User {
  id: string;
  name: string;
  email: string;
  mainCurrencyId: string;
  hasPassword?: boolean;
  createdAt: Date;
  updatedAt: Date;
  mainCurrency?: Currency;
}
