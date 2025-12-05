import { FinancialAccount } from './FinancialAccount';
import { User } from './User';

export interface AccountInvite {
  id?: string;
  status?: InviteStatus;
  email: string;
  userId?: string;
  accountId?: string;
  user?: User;
  financialAccount?: FinancialAccount;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum InviteStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
}
