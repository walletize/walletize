import { AccountType } from './AccountType';

export interface AccountCategory {
  id: string;
  name: string;
  typeId: string;
  accountType: AccountType;
}
