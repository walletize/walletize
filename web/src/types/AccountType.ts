import { AccountCategory } from './AccountCategory';

export interface AccountType {
  id: string;
  name: string;
  accountCategories: AccountCategory[];
}
