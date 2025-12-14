import { Prisma } from '@prisma/client';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

type PreparedQuery = {
  templateStrings: TemplateStringsArray;
  placeholders: number[];
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sqlDir = (() => {
  const distPath = path.join(__dirname, 'sql');
  if (existsSync(distPath)) {
    return distPath;
  }
  return path.resolve(__dirname, '..', '..', 'src', 'prisma', 'sql');
})();

const toTemplateStrings = (parts: string[]): TemplateStringsArray => {
  const raw = [...parts];
  return Object.assign([...parts], { raw }) as unknown as TemplateStringsArray;
};

const loadQuery = (fileName: string): PreparedQuery => {
  const query = readFileSync(path.join(sqlDir, fileName), 'utf-8');
  const templateStrings = toTemplateStrings(query.split(/\$\d+/g));
  const placeholders = [...query.matchAll(/\$(\d+)/g)].map((match) => Number(match[1]));
  return { templateStrings, placeholders };
};

const buildSql = ({ templateStrings, placeholders }: PreparedQuery, params: unknown[]) => {
  const values = placeholders.map((index) => {
    const value = params[index - 1];
    if (typeof value === 'undefined') {
      throw new Error(`Missing parameter for placeholder $${index}`);
    }
    return value;
  });
  return Prisma.sql(templateStrings, ...values);
};

const queries = {
  getAccount: loadQuery('getAccount.sql'),
  getAccountValue: loadQuery('getAccountValue.sql'),
  getAccounts: loadQuery('getAccounts.sql'),
  getChartDataByAccount: loadQuery('getChartDataByAccount.sql'),
  getChartDataByUser: loadQuery('getChartDataByUser.sql'),
  getGroupedTransactionsByAccount: loadQuery('getGroupedTransactionsByAccount.sql'),
  getGroupedTransactionsByUser: loadQuery('getGroupedTransactionsByUser.sql'),
  getPrevAccountValue: loadQuery('getPrevAccountValue.sql'),
  getPrevAccountsValue: loadQuery('getPrevAccountsValue.sql'),
  getPrevAccountsValueByType: loadQuery('getPrevAccountsValueByType.sql'),
  getPrevTransactionsValueByAccount: loadQuery('getPrevTransactionsValueByAccount.sql'),
  getPrevTransactionsValueByUser: loadQuery('getPrevTransactionsValueByUser.sql'),
  getTotalAccountsInitialValue: loadQuery('getTotalAccountsInitialValue.sql'),
  getTransactionsCountByAccount: loadQuery('getTransactionsCountByAccount.sql'),
  getTransactionsCountByUser: loadQuery('getTransactionsCountByUser.sql'),
  getTransactionsStartEndDateByAccount: loadQuery('getTransactionsStartEndDateByAccount.sql'),
  getTransactionsStartEndDateByUser: loadQuery('getTransactionsStartEndDateByUser.sql'),
  getTransactionsSumByCategory: loadQuery('getTransactionsSumByCategory.sql'),
} as const;

export const getAccount = (accountId: string, endDate?: Date | null) =>
  buildSql(queries.getAccount, [accountId, endDate ?? null]);

export const getAccountValue = (accountId: string, endDate?: Date | null) =>
  buildSql(queries.getAccountValue, [accountId, endDate ?? null]);

export const getAccounts = (userId: string, endDate?: Date | null) =>
  buildSql(queries.getAccounts, [userId, endDate ?? null]);

export const getChartDataByAccount = (
  startDate: Date,
  endDate: Date,
  interval: string,
  accountId: string,
  initialValue: number,
) => buildSql(queries.getChartDataByAccount, [startDate, endDate, interval, accountId, initialValue]);

export const getChartDataByUser = (
  startDate: Date,
  endDate: Date,
  interval: string,
  userId: string,
  totalAssetsInitialValue: number,
  totalLiabilitiesInitialValue: number,
) =>
  buildSql(queries.getChartDataByUser, [
    startDate,
    endDate,
    interval,
    userId,
    totalAssetsInitialValue,
    totalLiabilitiesInitialValue,
  ]);

export const getGroupedTransactionsByAccount = (accountId: string, startDate: Date, endDate: Date, offset: number) =>
  buildSql(queries.getGroupedTransactionsByAccount, [accountId, startDate, endDate, offset]);

export const getGroupedTransactionsByUser = (
  userId: string,
  startDate: Date,
  endDate: Date,
  offset: number,
  search?: string,
) => buildSql(queries.getGroupedTransactionsByUser, [userId, startDate, endDate, offset, search || '']);

export const getPrevAccountValue = (accountId: string, endDate: Date) =>
  buildSql(queries.getPrevAccountValue, [accountId, endDate]);

export const getPrevAccountsValue = (type: string, userId: string, endDate: Date) =>
  buildSql(queries.getPrevAccountsValue, [type, userId, endDate]);

export const getPrevAccountsValueByType = (userId: string, accountType: string, endDate: Date) =>
  buildSql(queries.getPrevAccountsValueByType, [userId, accountType, endDate]);

export const getPrevTransactionsValueByAccount = (
  accountId: string,
  startDate: Date,
  endDate: Date,
  transactionType: string,
) => buildSql(queries.getPrevTransactionsValueByAccount, [accountId, startDate, endDate, transactionType]);

export const getPrevTransactionsValueByUser = (
  userId: string,
  startDate: Date,
  endDate: Date,
  transactionType: string,
) => buildSql(queries.getPrevTransactionsValueByUser, [userId, startDate, endDate, transactionType]);

export const getTotalAccountsInitialValue = (userId: string, type: string) =>
  buildSql(queries.getTotalAccountsInitialValue, [userId, type]);

export const getTransactionsCountByAccount = (accountId: string, startDate: Date, endDate: Date) =>
  buildSql(queries.getTransactionsCountByAccount, [accountId, startDate, endDate]);

export const getTransactionsCountByUser = (userId: string, startDate: Date, endDate: Date, search?: string) =>
  buildSql(queries.getTransactionsCountByUser, [userId, startDate, endDate, search || '']);

export const getTransactionsStartEndDateByAccount = (accountId: string) =>
  buildSql(queries.getTransactionsStartEndDateByAccount, [accountId]);

export const getTransactionsStartEndDateByUser = (userId: string) =>
  buildSql(queries.getTransactionsStartEndDateByUser, [userId]);

export const getTransactionsSumByCategory = (userId: string, type: string, startDate: Date, endDate: Date) =>
  buildSql(queries.getTransactionsSumByCategory, [userId, type, startDate, endDate]);
