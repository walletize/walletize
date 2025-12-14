import { parseCurrencyInput } from '@/lib/utils';
import { Currency } from '@/types/Currency';
import { FinancialAccount } from '@/types/FinancialAccount';
import { Transaction } from '@/types/Transaction';
import { TransactionCategory } from '@/types/TransactionCategory';
import { TransactionTransfer } from '@/types/TransactionTransfer';
import { TransactionType } from '@/types/TransactionType';
import { getApiUrl } from '@/lib/api';

export async function addTransaction(
  formData: FormData,
  selectedCategory: TransactionCategory,
  selectedAccount: FinancialAccount,
  date: Date,
  selectedCurrency: Currency,
  baseRate: string,
  quoteRate: string,
  selectedReccurence: string,
  recurrenceEndDate: Date,
) {
  const description = formData.get('description') as string;
  const amount = formData.get('amount') as string;

  const parsedAmount: number = parseCurrencyInput(amount);
  let utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  utcDate = new Date(utcDate.setUTCHours(0, 0, 0, 0));
  let utcRecurrenceEndDate = new Date(recurrenceEndDate.getTime() - recurrenceEndDate.getTimezoneOffset() * 60000);
  utcRecurrenceEndDate = new Date(utcRecurrenceEndDate.setUTCHours(0, 0, 0, 0));

  let rate = null;
  if (selectedAccount.currencyId != selectedCurrency.id) {
    const cleanBaseRate = baseRate.replace(',', '');
    const cleanQuoteRate = quoteRate.replace(',', '');
    rate = Math.floor((parseFloat(cleanQuoteRate) / parseFloat(cleanBaseRate)) * 1e8) / 1e8;
  }

  const res = await fetch(getApiUrl() + '/transactions', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Origin: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3101',
    },
    body: JSON.stringify({
      transaction: {
        description,
        amount: parsedAmount,
        rate,
        categoryId: selectedCategory.id,
        accountId: selectedAccount.id,
        currencyId: selectedCurrency.id,
        date: utcDate,
      },
      selectedReccurence,
      recurrenceEndDate: utcRecurrenceEndDate,
    }),
  });

  const body = await res.json();
  return { ok: res.ok, message: body.message };
}

export async function addTransferTransaction(
  formData: FormData,
  originAccount: FinancialAccount | null,
  destinationAccount: FinancialAccount | null,
  date: Date,
  selectedCurrency: Currency,
  baseRate: string,
  quoteRate: string,
  selectedCategory?: TransactionCategory,
  selectedType?: TransactionType,
) {
  const description = formData.get('description') as string;
  const amount = formData.get('amount') as string;

  const parsedAmount: number = parseCurrencyInput(amount);
  let utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  utcDate = new Date(utcDate.setUTCHours(0, 0, 0, 0));

  let rate = null;
  if (
    (originAccount && destinationAccount && originAccount.currencyId != destinationAccount.currencyId) ||
    (!originAccount && destinationAccount?.currencyId != selectedCurrency.id) ||
    (!destinationAccount && originAccount?.currencyId != selectedCurrency.id)
  ) {
    const cleanBaseRate = baseRate.replace(',', '');
    const cleanQuoteRate = quoteRate.replace(',', '');
    rate = Math.floor((parseFloat(cleanQuoteRate) / parseFloat(cleanBaseRate)) * 1e8) / 1e8;
  }

  const res = await fetch(getApiUrl() + '/transactions/transfer', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Origin: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3101',
    },
    body: JSON.stringify({
      amount: parsedAmount,
      description,
      rate,
      originAccountId: originAccount?.id ?? null,
      destinationAccountId: destinationAccount?.id ?? null,
      selectedCurrencyId: selectedCurrency.id,
      date: utcDate,
      categoryId: selectedCategory?.id ?? null,
      typeId: selectedType?.id ?? null,
    }),
  });

  const body = await res.json();
  return { ok: res.ok, message: body.message };
}

export async function addUpdateTransaction(
  formData: FormData,
  selectedAccount: FinancialAccount,
  date: Date,
  selectedCurrency: Currency,
  baseRate: string,
  quoteRate: string,
) {
  const description = formData.get('description') as string;
  const newValue = formData.get('newValue') as string;
  const amount = formData.get('amount') as string;

  const parsedNewValue: number = parseCurrencyInput(newValue);
  const parsedAmount: number = parseCurrencyInput(amount);
  let utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  utcDate = new Date(utcDate.setUTCHours(0, 0, 0, 0));

  let rate = null;
  if (selectedAccount.currencyId != selectedCurrency.id) {
    const cleanBaseRate = baseRate.replace(',', '');
    const cleanQuoteRate = quoteRate.replace(',', '');
    rate = Math.floor((parseFloat(cleanQuoteRate) / parseFloat(cleanBaseRate)) * 1e8) / 1e8;
  }

  const res = await fetch(getApiUrl() + '/transactions/update', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Origin: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3101',
    },
    body: JSON.stringify({
      description,
      newValue: parsedNewValue,
      amount: parsedAmount,
      rate,
      accountId: selectedAccount.id,
      currencyId: selectedCurrency.id,
      date: utcDate,
    }),
  });

  const body = await res.json();
  return { ok: res.ok, message: body.message };
}

export async function updateTransaction(
  transactionId: string,
  formData: FormData,
  selectedCategory: TransactionCategory,
  selectedAccount: FinancialAccount,
  date: Date,
  selectedCurrency: Currency,
  baseRate: string,
  quoteRate: string,
  transactionTransfer?: TransactionTransfer,
) {
  const description = formData.get('description') as string;
  const amount = formData.get('amount') as string;
  console.log(transactionTransfer);
  const parsedAmount: number = parseCurrencyInput(amount);
  let utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  utcDate = new Date(utcDate.setUTCHours(0, 0, 0, 0));

  let rate = null;
  if (
    selectedAccount.currencyId != selectedCurrency.id ||
    (transactionTransfer && transactionTransfer.originTransaction?.currencyId != selectedCurrency.id) ||
    (transactionTransfer && transactionTransfer.destinationTransaction?.currencyId != selectedCurrency.id)
  ) {
    const cleanBaseRate = baseRate.replace(',', '');
    const cleanQuoteRate = quoteRate.replace(',', '');
    rate = Math.floor((parseFloat(cleanQuoteRate) / parseFloat(cleanBaseRate)) * 1e8) / 1e8;
  }

  const res = await fetch(getApiUrl() + '/transactions/' + transactionId, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Origin: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3101',
    },
    body: JSON.stringify({
      description,
      amount: parsedAmount,
      rate,
      categoryId: selectedCategory.id,
      accountId: selectedAccount.id,
      currencyId: selectedCurrency.id,
      date: utcDate,
    }),
  });

  const body = await res.json();
  return { ok: res.ok, message: body.message };
}

export async function deleteTransaction(transaction: Transaction, recurringDeleteType?: string | null) {
  const res = await fetch(getApiUrl() + '/transactions/' + transaction.id, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Origin: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3101',
    },
    body: JSON.stringify({
      recurringDeleteType,
    }),
  });

  const body = await res.json();
  return { ok: res.ok, message: body.message };
}

export async function deleteTransactionsBulk(transactionIds: string[]) {
  const res = await fetch(getApiUrl() + '/transactions', {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Origin: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3101',
    },
    body: JSON.stringify({
      ids: transactionIds,
    }),
  });

  const body = await res.json();
  return { ok: res.ok, message: body.message, deleted: body.deleted, failed: body.failed };
}

export async function addTransactionCategory(
  formData: FormData,
  typeId: string,
  color: string,
  icon: string,
  iconColor: string,
) {
  const name = formData.get('name') as string;

  const res = await fetch(getApiUrl() + '/transactions/categories', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Origin: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3101',
    },
    body: JSON.stringify({
      name,
      typeId,
      color,
      icon,
      iconColor,
    }),
  });

  const body = await res.json();
  return { ok: res.ok, message: body.message };
}

export async function updateTransactionCategory(
  id: string,
  formData: FormData,
  typeId: string,
  color: string,
  icon: string,
  iconColor: string,
) {
  const name = formData.get('name') as string;

  const res = await fetch(getApiUrl() + '/transactions/categories/' + id, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Origin: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3101',
    },
    body: JSON.stringify({
      name,
      typeId,
      color,
      icon,
      iconColor,
    }),
  });

  const body = await res.json();
  return { ok: res.ok, message: body.message };
}

export async function deleteTransactionCategory(id: string) {
  const res = await fetch(getApiUrl() + '/transactions/categories/' + id, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Origin: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3101',
    },
  });

  const body = await res.json();
  return { ok: res.ok, message: body.message };
}
