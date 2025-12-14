import { InviteStatus, Prisma } from '@prisma/client';
import {
  getAccountValue,
  getChartDataByAccount,
  getChartDataByUser,
  getGroupedTransactionsByAccount,
  getGroupedTransactionsByUser,
  getPrevAccountsValueByType,
  getPrevAccountValue,
  getPrevTransactionsValueByAccount,
  getPrevTransactionsValueByUser,
  getTotalAccountsInitialValue,
  getTransactionsCountByAccount,
  getTransactionsCountByUser,
  getTransactionsStartEndDateByAccount,
  getTransactionsStartEndDateByUser,
  getTransactionsSumByCategory,
} from '../prisma/queries.js';
import express from 'express';
import { User } from 'lucia';
import pkg from 'rrule';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../app.js';
import { EXPENSE_ID, INCOME_ID, INCOMING_TRANSFER_ID, OUTGOING_TRANSFER_ID } from '../lib/constants.js';
import { validateData } from '../lib/midddleware.js';
import {
  bulkDeleteTransactionsSchema,
  createTransactionExpenseIncomeSchema,
  createTransactionTransferSchema,
  createUpdateTransactionSchema,
  deleteTransactionSchema,
  transactionCategorySchema,
  updateTransactionSchema,
} from '../lib/schemas/transactions.js';
import { getDateInterval, getPreviousPeriod } from '../lib/utils.js';
import { RawGroupedTransaction } from '../types/Transaction.js';
const { RRule } = pkg;

const router = express.Router();

router.post('/', validateData(createTransactionExpenseIncomeSchema), async (req, res) => {
  try {
    const localUser = res.locals.user as User;
    const { transaction, selectedReccurence, recurrenceEndDate } = req.body;

    const account = await prisma.financialAccount.findUnique({
      where: {
        id: transaction?.accountId,
      },
    });
    if (!account) {
      return res.status(404).json({ message: 'not_found' });
    }

    const acceptedInvite = await prisma.accountInvite.findFirst({
      where: {
        userId: localUser.id,
        status: InviteStatus.ACCEPTED,
        accountId: account?.id,
      },
    });
    if (localUser.id !== account?.userId && !acceptedInvite) {
      return res.status(403).json({ message: 'forbidden' });
    }

    if (selectedReccurence !== 'never') {
      let rrule = new RRule({
        freq: RRule.DAILY,
        dtstart: new Date(transaction.date),
        count: 0,
      });
      if (selectedReccurence === 'everyDay') {
        rrule = new RRule({
          freq: RRule.DAILY,
          dtstart: new Date(transaction.date),
          until: new Date(recurrenceEndDate),
        });
      } else if (selectedReccurence === 'everyTwoDays') {
        rrule = new RRule({
          freq: RRule.DAILY,
          interval: 2,
          dtstart: new Date(transaction.date),
          until: new Date(recurrenceEndDate),
        });
      } else if (selectedReccurence === 'everyWeekday') {
        rrule = new RRule({
          freq: RRule.DAILY,
          byweekday: [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR],
          dtstart: new Date(transaction.date),
          until: new Date(recurrenceEndDate),
        });
      } else if (selectedReccurence === 'everyWeekend') {
        rrule = new RRule({
          freq: RRule.DAILY,
          byweekday: [RRule.SA, RRule.SU],
          dtstart: new Date(transaction.date),
          until: new Date(recurrenceEndDate),
        });
      } else if (selectedReccurence === 'everyWeek') {
        rrule = new RRule({
          freq: RRule.WEEKLY,
          dtstart: new Date(transaction.date),
          until: new Date(recurrenceEndDate),
        });
      } else if (selectedReccurence === 'everyTwoWeeks') {
        rrule = new RRule({
          freq: RRule.WEEKLY,
          interval: 2,
          dtstart: new Date(transaction.date),
          until: new Date(recurrenceEndDate),
        });
      } else if (selectedReccurence === 'everyFourWeeks') {
        rrule = new RRule({
          freq: RRule.WEEKLY,
          interval: 4,
          dtstart: new Date(transaction.date),
          until: new Date(recurrenceEndDate),
        });
      } else if (selectedReccurence === 'everyMonth') {
        rrule = new RRule({
          freq: RRule.MONTHLY,
          dtstart: new Date(transaction.date),
          until: new Date(recurrenceEndDate),
        });
      } else if (selectedReccurence === 'everyTwoMonths') {
        rrule = new RRule({
          freq: RRule.MONTHLY,
          interval: 2,
          dtstart: new Date(transaction.date),
          until: new Date(recurrenceEndDate),
        });
      } else if (selectedReccurence === 'everyThreeMonths') {
        rrule = new RRule({
          freq: RRule.MONTHLY,
          interval: 3,
          dtstart: new Date(transaction.date),
          until: new Date(recurrenceEndDate),
        });
      } else if (selectedReccurence === 'everySixMonths') {
        rrule = new RRule({
          freq: RRule.MONTHLY,
          interval: 6,
          dtstart: new Date(transaction.date),
          until: new Date(recurrenceEndDate),
        });
      } else if (selectedReccurence === 'everyYear') {
        rrule = new RRule({
          freq: RRule.YEARLY,
          dtstart: new Date(transaction.date),
          until: new Date(recurrenceEndDate),
        });
      }

      const uuid = uuidv4();
      const recurringTransactions: Prisma.TransactionCreateManyInput[] = rrule.all().map((date) => {
        const recurringTransaction = {
          ...transaction,
          date,
          userId: localUser.id,
          recurrenceId: uuid,
        };
        return recurringTransaction;
      });

      await prisma.transaction.createMany({
        data: recurringTransactions,
      });
    } else {
      await prisma.transaction.create({
        data: {
          ...transaction,
          userId: localUser.id,
        },
      });
    }

    return res.status(200).json({ message: 'success' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'internal_error' });
  }
});

router.post('/transfer', validateData(createTransactionTransferSchema), async (req, res) => {
  try {
    const localUser = res.locals.user as User;
    const {
      originAccountId,
      destinationAccountId,
      selectedCurrencyId,
      date,
      description,
      amount,
      rate,
      categoryId,
      typeId,
    } = req.body;

    if (originAccountId && destinationAccountId) {
      const originAccount = await prisma.financialAccount.findUnique({
        where: {
          id: originAccountId,
        },
      });
      const destinationAccount = await prisma.financialAccount.findUnique({
        where: {
          id: destinationAccountId,
        },
      });
      if (!originAccount || !destinationAccount) {
        return res.status(404).json({ message: 'not_found' });
      }

      const originAcceptedInvite = await prisma.accountInvite.findFirst({
        where: {
          userId: localUser.id,
          status: InviteStatus.ACCEPTED,
          accountId: originAccount?.id,
        },
      });
      const destinationAcceptedInvite = await prisma.accountInvite.findFirst({
        where: {
          userId: localUser.id,
          status: InviteStatus.ACCEPTED,
          accountId: destinationAccount?.id,
        },
      });
      const hasOriginAccess = localUser.id === originAccount?.userId || originAcceptedInvite !== null;
      const hasDestinationAccess = localUser.id === destinationAccount?.userId || destinationAcceptedInvite !== null;
      if (!hasOriginAccess || !hasDestinationAccess) {
        return res.status(403).json({ message: 'forbidden' });
      }

      const originTranasaction = await prisma.transaction.create({
        data: {
          date,
          description,
          amount: -amount,
          rate,
          accountId: originAccountId,
          currencyId: selectedCurrencyId,
          categoryId: typeId === EXPENSE_ID && categoryId ? categoryId : OUTGOING_TRANSFER_ID,
          userId: localUser.id,
        },
      });
      const destinationTranasaction = await prisma.transaction.create({
        data: {
          date,
          description,
          amount,
          rate,
          accountId: destinationAccountId,
          currencyId: selectedCurrencyId,
          categoryId: typeId === INCOME_ID && categoryId ? categoryId : INCOMING_TRANSFER_ID,
          userId: localUser.id,
        },
      });
      await prisma.transactionTransfer.create({
        data: {
          originTransactionId: originTranasaction.id,
          destinationTransactionId: destinationTranasaction.id,
        },
      });
    } else {
      const account = await prisma.financialAccount.findUnique({
        where: {
          id: originAccountId ?? destinationAccountId,
        },
      });
      if (!account) {
        return res.status(404).json({ message: 'not_found' });
      }

      const acceptedInvite = await prisma.accountInvite.findFirst({
        where: {
          userId: localUser.id,
          status: InviteStatus.ACCEPTED,
          accountId: account.id,
        },
      });
      const hasAccess = localUser.id === account.userId || acceptedInvite !== null;
      if (!hasAccess) {
        return res.status(403).json({ message: 'forbidden' });
      }

      const transaction = await prisma.transaction.create({
        data: {
          date,
          description,
          amount: originAccountId ? -amount : amount,
          rate,
          accountId: account.id,
          currencyId: selectedCurrencyId,
          categoryId: originAccountId ? OUTGOING_TRANSFER_ID : INCOMING_TRANSFER_ID,
          userId: localUser.id,
        },
      });

      await prisma.transactionTransfer.create({
        data: {
          originTransactionId: originAccountId ? transaction.id : null,
          destinationTransactionId: destinationAccountId ? transaction.id : null,
        },
      });
    }

    return res.status(200).json({ message: 'success' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'internal_error' });
  }
});

router.post('/update', validateData(createUpdateTransactionSchema), async (req, res) => {
  try {
    const localUser = res.locals.user as User;
    const { description, newValue, amount, rate, currencyId, accountId, date } = req.body;

    const account = await prisma.financialAccount.findUnique({
      where: {
        id: accountId,
      },
    });
    if (!account) {
      return res.status(404).json({ message: 'not_found' });
    }

    const acceptedInvite = await prisma.accountInvite.findFirst({
      where: {
        userId: localUser.id,
        status: InviteStatus.ACCEPTED,
        accountId: account?.id,
      },
    });
    if (localUser.id !== account?.userId && !acceptedInvite) {
      return res.status(403).json({ message: 'forbidden' });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'invalid_format' });
    }

    const result = await prisma.$queryRaw<{ sum: number | bigint | null }[]>(getAccountValue(accountId, parsedDate));
    const sum = BigInt(Math.round(Number(result[0].sum ?? 0)));

    await prisma.transaction.create({
      data: {
        description,
        date,
        amount: amount ? amount : BigInt(newValue ?? 0) - (sum + account.initialValue),
        rate,
        accountId,
        currencyId,
        categoryId: '8e46c952-3378-49f6-bcfa-377351882dad',
        userId: localUser.id,
      },
    });

    return res.status(200).json({ message: 'success' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'internal_error' });
  }
});

router.get('/types', async (req, res) => {
  try {
    const localUser = res.locals.user as User;

    const transactionTypes = await prisma.transactionType.findMany({
      include: {
        transactionCategories: {
          where: {
            userId: localUser.id,
          },
          include: {
            _count: {
              select: { transactions: true },
            },
          },
          orderBy: {
            name: 'asc',
          },
        },
      },
    });

    return res.status(200).json(transactionTypes);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Internal error' });
  }
});

router.get('/categories/:userId/types/:typeId', async (req, res) => {
  try {
    const localUser = res.locals.user as User;
    const userId = req.params.userId;
    const typeId = req.params.typeId;

    if (localUser.id !== userId) {
      const acceptedInvite = await prisma.accountInvite.findFirst({
        where: {
          userId: localUser.id,
          status: InviteStatus.ACCEPTED,
          financialAccount: {
            userId,
          },
        },
      });

      if (!acceptedInvite) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    const transactionCategories = await prisma.transactionCategory.findMany({
      where: {
        userId,
        typeId,
      },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return res.status(200).json(transactionCategories);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Internal error' });
  }
});

router.get('/account/:accountId', async (req, res) => {
  try {
    const localUser = res.locals.user as User;
    const accountId = req.params.accountId as string;
    const startDateStr = req.query.startDate as string | undefined;
    const endDateStr = req.query.endDate as string | undefined;
    const page = req.query.page as string | undefined;

    const isRanged = startDateStr && startDateStr !== '' && endDateStr && endDateStr !== '';
    const previousPeriod = isRanged ? getPreviousPeriod(startDateStr, endDateStr) : null;

    const account = await prisma.financialAccount.findUnique({
      include: {
        accountInvites: true,
      },
      where: {
        id: accountId,
      },
    });

    if (localUser.id !== account?.userId && !account?.accountInvites.some((invite) => invite.userId === localUser.id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const transactionsStartEndDate = await prisma.$queryRaw<{ max: Date | null; min: Date | null }[]>(
      getTransactionsStartEndDateByAccount(accountId),
    );
    const transactionsStartDate = transactionsStartEndDate[0].min || new Date();
    transactionsStartDate.setDate(transactionsStartDate.getDate() - 1);
    const transactionsEndDate = transactionsStartEndDate[0].max || new Date();

    const rawGroupedTransactions = await prisma.$queryRaw<RawGroupedTransaction[]>(
      getGroupedTransactionsByAccount(
        accountId,
        previousPeriod && startDateStr ? new Date(startDateStr) : new Date('1900-01-01'),
        previousPeriod && endDateStr ? new Date(endDateStr) : new Date('9999-12-31'),
        page ? (parseInt(page) - 1) * 10 : 0,
      ),
    );
    const groupedTransactions = JSON.parse(
      JSON.stringify(rawGroupedTransactions, (_, value) => (typeof value === 'bigint' ? value.toString() : value)),
    );

    const rawGroupedTransactionsCount = await prisma.$queryRaw<{ count: number | bigint }[]>(
      getTransactionsCountByAccount(
        accountId,
        previousPeriod && startDateStr ? new Date(startDateStr) : new Date('1900-01-01'),
        previousPeriod && endDateStr ? new Date(endDateStr) : new Date('9999-12-31'),
      ),
    );
    const groupedTransactionsCount = Number(rawGroupedTransactionsCount[0].count);

    let prevValue = Number(account.initialValue);
    let prevIncome = 0;
    let prevExpenses = 0;
    if (previousPeriod) {
      const rawPrevValue = await prisma.$queryRaw<{ prevValue: number | null }[]>(
        getPrevAccountValue(accountId, new Date(previousPeriod.endDate)),
      );
      prevValue = (rawPrevValue[0].prevValue || 0) + Number(account.initialValue);

      const rawPrevIncome = await prisma.$queryRaw<{ prevValue: number | null }[]>(
        getPrevTransactionsValueByAccount(
          accountId,
          new Date(previousPeriod.startDate),
          new Date(previousPeriod.endDate),
          'Income',
        ),
      );
      prevIncome = rawPrevIncome[0].prevValue || 0;

      const rawPrevExpenses = await prisma.$queryRaw<{ prevValue: number | null }[]>(
        getPrevTransactionsValueByAccount(
          accountId,
          new Date(previousPeriod.startDate),
          new Date(previousPeriod.endDate),
          'Expense',
        ),
      );
      prevExpenses = rawPrevExpenses[0].prevValue || 0;
    }

    const chartData = await prisma.$queryRaw(
      getChartDataByAccount(
        isRanged ? new Date(startDateStr) : transactionsStartDate,
        isRanged ? new Date(endDateStr) : transactionsEndDate,
        isRanged
          ? getDateInterval(new Date(startDateStr), new Date(endDateStr))
          : getDateInterval(transactionsStartDate, transactionsEndDate),
        accountId,
        prevValue,
      ),
    );

    const hiddenTransactionsCount = isRanged
      ? await prisma.transaction.count({
          where: {
            accountId,
            OR: [{ date: { lt: new Date(startDateStr) } }, { date: { gt: new Date(endDateStr) } }],
          },
        })
      : 0;

    const combinedResults = {
      prevStartDate: previousPeriod ? new Date(previousPeriod.startDate) : null,
      prevEndDate: previousPeriod ? new Date(previousPeriod.endDate) : null,
      prevValue,
      prevIncome,
      prevExpenses,
      groupedTransactions,
      groupedTransactionsCount,
      chartData,
      hiddenTransactionsCount,
    };

    return res.status(200).json(combinedResults);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Internal error' });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const localUser = res.locals.user as User;
    const userId = req.params.userId as string;
    const startDateStr = req.query.startDate as string | undefined;
    const endDateStr = req.query.endDate as string | undefined;
    const page = req.query.page as string | undefined;
    const search = (req.query.search as string | undefined) || '';

    const isRanged = startDateStr && startDateStr !== '' && endDateStr && endDateStr !== '';
    const previousPeriod = isRanged ? getPreviousPeriod(startDateStr, endDateStr) : null;

    if (localUser.id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const transactionsStartEndDate = await prisma.$queryRaw<{ max: Date | null; min: Date | null }[]>(
      getTransactionsStartEndDateByUser(userId),
    );
    const transactionsStartDate = transactionsStartEndDate[0].min || new Date();
    transactionsStartDate.setDate(transactionsStartDate.getDate() - 1);
    const transactionsEndDate = transactionsStartEndDate[0].max || new Date();
    const searchFilter =
      search && search.trim() !== ''
        ? {
            OR: [
              { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { transactionCategory: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
              { financialAccount: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
            ],
          }
        : undefined;

    const rawGroupedTransactions = await prisma.$queryRaw<RawGroupedTransaction[]>(
      getGroupedTransactionsByUser(
        userId,
        previousPeriod && startDateStr ? new Date(startDateStr) : new Date('1900-01-01'),
        previousPeriod && endDateStr ? new Date(endDateStr) : new Date('9999-12-31'),
        page ? (parseInt(page) - 1) * 10 : 0,
        search,
      ),
    );
    const groupedTransactions: RawGroupedTransaction[] = JSON.parse(
      JSON.stringify(rawGroupedTransactions, (_, value) => (typeof value === 'bigint' ? value.toString() : value)),
    );

    const rawGroupedTransactionsCount = await prisma.$queryRaw<{ count: number | bigint }[]>(
      getTransactionsCountByUser(
        userId,
        previousPeriod && startDateStr ? new Date(startDateStr) : new Date('1900-01-01'),
        previousPeriod && endDateStr ? new Date(endDateStr) : new Date('9999-12-31'),
        search,
      ),
    );
    const groupedTransactionsCount = Number(rawGroupedTransactionsCount[0].count);

    const rawTotalAssetsInitialValue = await prisma.$queryRaw<{ totalInitialValue: number | null }[]>(
      getTotalAccountsInitialValue(userId, 'Asset'),
    );
    const totalAssetsInitialValue = Number(rawTotalAssetsInitialValue[0].totalInitialValue);
    const rawTotalLiabilitiesInitialValue = await prisma.$queryRaw<{ totalInitialValue: number | null }[]>(
      getTotalAccountsInitialValue(userId, 'Liability'),
    );
    const totalLiabilitiesInitialValue = Number(rawTotalLiabilitiesInitialValue[0].totalInitialValue);

    let prevIncome = 0;
    let prevExpenses = 0;
    let prevAssetsValue = totalAssetsInitialValue;
    let prevLiabilitiesValue = totalLiabilitiesInitialValue;
    if (previousPeriod) {
      const rawPrevIncome = await prisma.$queryRaw<{ prevValue: number | null }[]>(
        getPrevTransactionsValueByUser(
          userId,
          new Date(previousPeriod.startDate),
          new Date(previousPeriod.endDate),
          'Income',
        ),
      );
      prevIncome = rawPrevIncome[0].prevValue || 0;

      const rawPrevExpenses = await prisma.$queryRaw<{ prevValue: number | null }[]>(
        getPrevTransactionsValueByUser(
          userId,
          new Date(previousPeriod.startDate),
          new Date(previousPeriod.endDate),
          'Expense',
        ),
      );
      prevExpenses = rawPrevExpenses[0].prevValue || 0;

      const rawPrevAssetsValue = await prisma.$queryRaw<{ prevValue: number | null }[]>(
        getPrevAccountsValueByType(userId, 'Asset', new Date(previousPeriod.endDate)),
      );
      prevAssetsValue = totalAssetsInitialValue + (rawPrevAssetsValue[0].prevValue || 0);

      const rawPrevLiabilitiesValue = await prisma.$queryRaw<{ prevValue: number | null }[]>(
        getPrevAccountsValueByType(userId, 'Liability', new Date(previousPeriod.endDate)),
      );
      prevLiabilitiesValue = totalLiabilitiesInitialValue + (rawPrevLiabilitiesValue[0].prevValue || 0);
    }

    const chartData = await prisma.$queryRaw(
      getChartDataByUser(
        isRanged ? new Date(startDateStr) : transactionsStartDate,
        isRanged ? new Date(endDateStr) : transactionsEndDate,
        isRanged
          ? getDateInterval(new Date(startDateStr), new Date(endDateStr))
          : getDateInterval(transactionsStartDate, transactionsEndDate),
        userId,
        prevAssetsValue,
        prevLiabilitiesValue,
      ),
    );

    const hiddenTransactionsCount = isRanged
      ? await prisma.transaction.count({
          where: {
            OR: [{ date: { lt: new Date(startDateStr) } }, { date: { gt: new Date(endDateStr) } }],
            AND: [
              {
                OR: [
                  { userId },
                  {
                    financialAccount: {
                      accountInvites: {
                        some: {
                          userId,
                          status: InviteStatus.ACCEPTED,
                        },
                      },
                    },
                  },
                ],
              },
              ...(searchFilter ? [searchFilter] : []),
            ],
          },
        })
      : 0;

    const combinedResults = {
      prevStartDate: previousPeriod ? new Date(previousPeriod.startDate) : null,
      prevEndDate: previousPeriod ? new Date(previousPeriod.endDate) : null,
      prevIncome,
      prevExpenses,
      prevAssetsValue,
      prevLiabilitiesValue,
      groupedTransactions,
      groupedTransactionsCount,
      chartData,
      hiddenTransactionsCount,
    };

    return res.status(200).json(combinedResults);
  } catch (e) {
    console.error(e);

    return res.status(500).json({ message: 'Internal error' });
  }
});

router.put('/:transactionId', validateData(updateTransactionSchema), async (req, res) => {
  try {
    const localUser = res.locals.user as User;
    const transactionId = req.params.transactionId;
    const updatedTransaction = req.body;

    const transaction = await prisma.transaction.findUnique({
      include: {
        financialAccount: true,
        destinationTransactionTransfer: {
          include: {
            originTransaction: {
              include: {
                financialAccount: true,
              },
            },
          },
        },
        originTransactionTransfer: {
          include: {
            destinationTransaction: {
              include: {
                financialAccount: true,
              },
            },
          },
        },
      },
      where: {
        id: transactionId,
      },
    });
    if (!transaction) {
      return res.status(404).json({ message: 'not_found' });
    }

    const account = await prisma.financialAccount.findUnique({
      where: {
        id: transaction?.accountId,
      },
    });
    const acceptedInvite = await prisma.accountInvite.findFirst({
      where: {
        userId: localUser.id,
        status: InviteStatus.ACCEPTED,
        accountId: account?.id,
      },
    });
    if (localUser.id !== account?.userId && !acceptedInvite) {
      return res.status(403).json({ message: 'forbidden' });
    }

    if (transaction.originTransactionTransfer || transaction.destinationTransactionTransfer) {
      if (transaction.originTransactionTransfer?.destinationTransactionId) {
        await prisma.transaction.update({
          where: {
            id: transaction.originTransactionTransfer.destinationTransactionId,
          },
          data: {
            date: updatedTransaction.date,
            amount: updatedTransaction.amount,
            description: updatedTransaction.description,
            rate: updatedTransaction.rate,
            currencyId: updatedTransaction.currencyId,
          },
        });

        await prisma.transaction.update({
          where: {
            id: transactionId,
          },
          data: {
            date: updatedTransaction.date,
            amount: -updatedTransaction.amount,
            description: updatedTransaction.description,
            rate: updatedTransaction.rate,
            currencyId: updatedTransaction.currencyId,
          },
        });
      } else if (transaction.destinationTransactionTransfer?.originTransactionId) {
        await prisma.transaction.update({
          where: {
            id: transaction.destinationTransactionTransfer.originTransactionId,
          },
          data: {
            date: updatedTransaction.date,
            amount: -updatedTransaction.amount,
            description: updatedTransaction.description,
            rate: updatedTransaction.rate,
            currencyId: updatedTransaction.currencyId,
          },
        });

        await prisma.transaction.update({
          where: {
            id: transactionId,
          },
          data: {
            date: updatedTransaction.date,
            amount: updatedTransaction.amount,
            description: updatedTransaction.description,
            rate: updatedTransaction.rate,
            currencyId: updatedTransaction.currencyId,
          },
        });
      }
    } else {
      await prisma.transaction.update({
        where: {
          id: transactionId,
        },
        data: updatedTransaction,
      });
    }

    return res.status(200).json({ message: 'success' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'internal_error' });
  }
});

router.delete('/', validateData(bulkDeleteTransactionsSchema), async (req, res) => {
  try {
    const localUser = res.locals.user as User;
    const ids: string[] = req.body.ids;
    const results: { id: string; status: 'deleted' | 'failed'; reason?: string }[] = [];

    const uniqueIds = [...new Set(ids)];
    const seenIds = new Set<string>();
    const idsSet = new Set(ids);

    const transactions = await prisma.transaction.findMany({
      where: {
        id: { in: uniqueIds },
      },
      include: {
        financialAccount: true,
        destinationTransactionTransfer: true,
        originTransactionTransfer: true,
      },
    });

    const transactionsById = new Map(transactions.map((t) => [t.id, t]));

    const accountIds = new Set<string>();
    const linkedTransactionIds = new Set<string>();
    transactions.forEach((t) => {
      if (t.financialAccount?.id) {
        accountIds.add(t.financialAccount.id);
      }
      if (t.originTransactionTransfer?.destinationTransactionId) {
        linkedTransactionIds.add(t.originTransactionTransfer.destinationTransactionId);
      }
      if (t.destinationTransactionTransfer?.originTransactionId) {
        linkedTransactionIds.add(t.destinationTransactionTransfer.originTransactionId);
      }
    });

    const linkedIdsToFetch = Array.from(linkedTransactionIds).filter((id) => !transactionsById.has(id));
    if (linkedIdsToFetch.length > 0) {
      const linkedTransactions = await prisma.transaction.findMany({
        where: {
          id: { in: linkedIdsToFetch },
        },
        include: {
          financialAccount: true,
          destinationTransactionTransfer: true,
          originTransactionTransfer: true,
        },
      });
      linkedTransactions.forEach((t) => {
        transactionsById.set(t.id, t);
        if (t.financialAccount?.id) {
          accountIds.add(t.financialAccount.id);
        }
      });
    }

    const accountInvites = await prisma.accountInvite.findMany({
      where: {
        userId: localUser.id,
        status: InviteStatus.ACCEPTED,
        accountId: { in: Array.from(accountIds) },
      },
    });

    const invitedAccountIds = new Set(accountInvites.map((invite) => invite.accountId));

    const deletableTransactions: {
      id: string;
      transaction: (typeof transactions)[0];
      linkedTransactionId?: string;
      transferId?: string;
      isOrigin?: boolean;
    }[] = [];
    const linkedTransactionIdsToDelete = new Set<string>();
    const transferIdsToDelete = new Set<string>();

    for (const id of ids) {
      if (seenIds.has(id)) {
        continue;
      }
      seenIds.add(id);

      const transaction = transactionsById.get(id);
      if (!transaction) {
        results.push({ id, status: 'failed', reason: 'not_found' });
        continue;
      }

      const account = transaction.financialAccount;
      const hasAccess = localUser.id === account?.userId || (account?.id && invitedAccountIds.has(account.id));

      if (!hasAccess) {
        results.push({ id, status: 'failed', reason: 'forbidden' });
        continue;
      }

      if (transaction.originTransactionTransfer) {
        const transfer = transaction.originTransactionTransfer;
        if (transfer.destinationTransactionId) {
          const linkedTransaction = transactionsById.get(transfer.destinationTransactionId);
          if (linkedTransaction && linkedTransaction.financialAccount) {
            const linkedAccount = linkedTransaction.financialAccount;
            const hasLinkedAccess =
              localUser.id === linkedAccount.userId || (linkedAccount.id && invitedAccountIds.has(linkedAccount.id));

            if (!hasLinkedAccess) {
              results.push({ id, status: 'failed', reason: 'forbidden' });
              continue;
            }

            transferIdsToDelete.add(transfer.id);
            linkedTransactionIdsToDelete.add(transfer.destinationTransactionId);
            deletableTransactions.push({
              id,
              transaction,
              linkedTransactionId: transfer.destinationTransactionId,
              transferId: transfer.id,
              isOrigin: true,
            });
          } else {
            transferIdsToDelete.add(transfer.id);
            deletableTransactions.push({
              id,
              transaction,
              transferId: transfer.id,
              isOrigin: true,
            });
          }
        } else {
          transferIdsToDelete.add(transfer.id);
          deletableTransactions.push({
            id,
            transaction,
            transferId: transfer.id,
            isOrigin: true,
          });
        }
      } else if (transaction.destinationTransactionTransfer) {
        const transfer = transaction.destinationTransactionTransfer;
        if (transfer.originTransactionId) {
          const linkedTransaction = transactionsById.get(transfer.originTransactionId);
          if (linkedTransaction && linkedTransaction.financialAccount) {
            const linkedAccount = linkedTransaction.financialAccount;
            const hasLinkedAccess =
              localUser.id === linkedAccount.userId || (linkedAccount.id && invitedAccountIds.has(linkedAccount.id));

            if (!hasLinkedAccess) {
              results.push({ id, status: 'failed', reason: 'forbidden' });
              continue;
            }

            transferIdsToDelete.add(transfer.id);
            linkedTransactionIdsToDelete.add(transfer.originTransactionId);
            deletableTransactions.push({
              id,
              transaction,
              linkedTransactionId: transfer.originTransactionId,
              transferId: transfer.id,
              isOrigin: false,
            });
          } else {
            transferIdsToDelete.add(transfer.id);
            deletableTransactions.push({
              id,
              transaction,
              transferId: transfer.id,
              isOrigin: false,
            });
          }
        } else {
          transferIdsToDelete.add(transfer.id);
          deletableTransactions.push({
            id,
            transaction,
            transferId: transfer.id,
            isOrigin: false,
          });
        }
      } else {
        deletableTransactions.push({
          id,
          transaction,
        });
      }
    }

    try {
      if (transferIdsToDelete.size > 0) {
        await prisma.transactionTransfer.deleteMany({
          where: {
            id: { in: Array.from(transferIdsToDelete) },
          },
        });
      }

      if (linkedTransactionIdsToDelete.size > 0) {
        await prisma.transaction.deleteMany({
          where: {
            id: { in: Array.from(linkedTransactionIdsToDelete) },
          },
        });

        for (const linkedId of linkedTransactionIdsToDelete) {
          if (!idsSet.has(linkedId)) {
            results.push({ id: linkedId, status: 'deleted' });
          }
        }
      }

      const mainTransactionIds = deletableTransactions.map((dt) => dt.id);
      if (mainTransactionIds.length > 0) {
        await prisma.transaction.deleteMany({
          where: {
            id: { in: mainTransactionIds },
          },
        });

        for (const dt of deletableTransactions) {
          results.push({ id: dt.id, status: 'deleted' });
        }
      }
    } catch (e) {
      console.error(e);
      for (const dt of deletableTransactions) {
        if (!results.some((r) => r.id === dt.id)) {
          results.push({ id: dt.id, status: 'failed', reason: 'internal_error' });
        }
      }
      for (const linkedId of linkedTransactionIdsToDelete) {
        if (idsSet.has(linkedId) && !results.some((r) => r.id === linkedId)) {
          results.push({ id: linkedId, status: 'failed', reason: 'internal_error' });
        }
      }
    }

    const failed = results.filter((result) => result.status === 'failed');
    const deleted = results.filter((result) => result.status === 'deleted').length;
    const statusCode = failed.length > 0 && deleted > 0 ? 207 : failed.length > 0 ? 400 : 200;
    return res.status(statusCode).json({
      message: failed.length > 0 ? (deleted > 0 ? 'partial_success' : 'failure') : 'success',
      deleted,
      failed,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'internal_error' });
  }
});

router.delete('/:transactionId', validateData(deleteTransactionSchema), async (req, res) => {
  try {
    const localUser = res.locals.user as User;
    const transactionId = req.params.transactionId;
    const deleteType = req.body.recurringDeleteType;

    const transaction = await prisma.transaction.findUnique({
      include: {
        financialAccount: true,
        destinationTransactionTransfer: true,
        originTransactionTransfer: true,
      },
      where: {
        id: transactionId,
      },
    });
    if (!transaction) {
      return res.status(404).json({ message: 'not_found' });
    }

    const account = await prisma.financialAccount.findUnique({
      where: {
        id: transaction?.accountId,
      },
    });
    const acceptedInvite = await prisma.accountInvite.findFirst({
      where: {
        userId: localUser.id,
        status: InviteStatus.ACCEPTED,
        accountId: account?.id,
      },
    });
    if (localUser.id !== account?.userId && !acceptedInvite) {
      return res.status(403).json({ message: 'forbidden' });
    }

    if (transaction.originTransactionTransfer || transaction.destinationTransactionTransfer) {
      if (transaction.originTransactionTransfer) {
        await prisma.transactionTransfer.delete({
          where: {
            id: transaction.originTransactionTransfer.id,
          },
        });

        if (transaction.originTransactionTransfer.destinationTransactionId)
          await prisma.transaction.delete({
            where: {
              id: transaction.originTransactionTransfer.destinationTransactionId,
            },
          });
      } else if (transaction.destinationTransactionTransfer) {
        await prisma.transactionTransfer.delete({
          where: {
            id: transaction.destinationTransactionTransfer.id,
          },
        });

        if (transaction.destinationTransactionTransfer.originTransactionId)
          await prisma.transaction.delete({
            where: {
              id: transaction.destinationTransactionTransfer.originTransactionId,
            },
          });
      }
    }

    if (deleteType === 'this_and_following') {
      await prisma.transaction.delete({
        where: {
          id: transaction.id,
        },
      });

      await prisma.transaction.deleteMany({
        where: {
          recurrenceId: transaction.recurrenceId,
          date: {
            gte: transaction.date,
          },
        },
      });
    } else if (deleteType === 'all') {
      await prisma.transaction.deleteMany({
        where: {
          recurrenceId: transaction.recurrenceId,
        },
      });
    } else {
      await prisma.transaction.delete({
        where: {
          id: transactionId,
        },
      });
    }

    return res.status(200).json({ message: 'success' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'internal_error' });
  }
});

router.post('/categories', validateData(transactionCategorySchema), async (req, res) => {
  try {
    const localUser = res.locals.user as User;
    const category = req.body;

    await prisma.transactionCategory.create({
      data: {
        ...category,
        userId: localUser.id,
      },
    });

    return res.status(200).json({ message: 'Success' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Internal error' });
  }
});

router.put('/categories/:categoryId', validateData(transactionCategorySchema), async (req, res) => {
  try {
    const localUser = res.locals.user as User;
    const categoryId = req.params.categoryId;
    const updatedCategory = req.body;

    const category = await prisma.transactionCategory.findUnique({
      where: {
        id: categoryId,
      },
    });
    if (!category) {
      return res.status(404).json({ message: 'not_found' });
    }
    if (localUser.id !== category.userId) {
      return res.status(403).json({ message: 'forbidden' });
    }

    await prisma.transactionCategory.update({
      where: {
        id: categoryId,
      },
      data: updatedCategory,
    });

    return res.status(200).json({ message: 'success' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'internal_error' });
  }
});

router.delete('/categories/:categoryId', async (req, res) => {
  try {
    const localUser = res.locals.user as User;
    const categoryId = req.params.categoryId;

    const category = await prisma.transactionCategory.findUnique({
      where: {
        id: categoryId,
      },
    });
    if (!category) {
      return res.status(404).json({ message: 'not_found' });
    }
    if (localUser.id !== category.userId) {
      return res.status(403).json({ message: 'forbidden' });
    }

    const existingCategoryCount = await prisma.transactionCategory.count({
      where: {
        userId: category.userId,
        typeId: category.typeId,
      },
    });
    if (existingCategoryCount === 1) {
      return res.status(400).json({ message: 'category_cannot_be_empty' });
    }

    await prisma.transactionCategory.delete({
      where: {
        id: categoryId,
      },
    });

    return res.status(200).json({ message: 'success' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'internal_error' });
  }
});

router.get('/chart', async (req, res) => {
  try {
    const localUser = res.locals.user as User;
    const startDateStr = req.query.startDate as string | undefined;
    const endDateStr = req.query.endDate as string | undefined;

    const isRanged = startDateStr && startDateStr !== '' && endDateStr && endDateStr !== '';
    const previousPeriod = isRanged ? getPreviousPeriod(startDateStr, endDateStr) : null;

    const incomeSumByCategoryQuery = prisma.$queryRaw(
      getTransactionsSumByCategory(
        localUser.id,
        'Income',
        previousPeriod && startDateStr ? new Date(startDateStr) : new Date('1900-01-01'),
        previousPeriod && endDateStr ? new Date(endDateStr) : new Date('9999-12-31'),
      ),
    );

    const expenseSumByCategoryQuery = prisma.$queryRaw(
      getTransactionsSumByCategory(
        localUser.id,
        'Expense',
        previousPeriod && startDateStr ? new Date(startDateStr) : new Date('1900-01-01'),
        previousPeriod && endDateStr ? new Date(endDateStr) : new Date('9999-12-31'),
      ),
    );

    const [incomeSumByCategory, expenseSumByCategory] = await Promise.all([
      incomeSumByCategoryQuery,
      expenseSumByCategoryQuery,
    ]);

    return res.status(200).json({
      incomeSumByCategory,
      expenseSumByCategory,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'internal_error' });
  }
});

export default router;
