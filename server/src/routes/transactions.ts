import { Prisma } from '@prisma/client';
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
} from '@prisma/client/sql.js';
import express from 'express';
import { User } from 'lucia';
import pkg from 'rrule';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../app.js';
import { EXPENSE_ID, INCOME_ID, INCOMING_TRANSFER_ID, OUTGOING_TRANSFER_ID } from '../lib/constants.js';
import { validateData } from '../lib/midddleware.js';
import {
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
        status: 'ACCEPTED',
        financialAccount: {
          userId: account?.userId,
        },
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
          status: 'ACCEPTED',
          financialAccount: {
            userId: originAccount?.userId,
          },
        },
      });
      const destinationAcceptedInvite = await prisma.accountInvite.findFirst({
        where: {
          userId: localUser.id,
          status: 'ACCEPTED',
          financialAccount: {
            userId: destinationAccount?.userId,
          },
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
          status: 'ACCEPTED',
          financialAccount: {
            userId: account.userId,
          },
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
        status: 'ACCEPTED',
        financialAccount: {
          userId: account?.userId,
        },
      },
    });
    if (localUser.id !== account?.userId && !acceptedInvite) {
      return res.status(403).json({ message: 'forbidden' });
    }

    const result = await prisma.$queryRawTyped(getAccountValue(accountId));
    const sum = BigInt(Math.round(result[0].sum ?? 0));

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
          status: 'ACCEPTED',
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

    const transactionsStartEndDate = await prisma.$queryRawTyped(getTransactionsStartEndDateByAccount(accountId));
    const transactionsStartDate = transactionsStartEndDate[0].min || new Date();
    transactionsStartDate.setDate(transactionsStartDate.getDate() - 1);
    const transactionsEndDate = transactionsStartEndDate[0].max || new Date();

    const rawGroupedTransactions = await prisma.$queryRawTyped(
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

    const rawGroupedTransactionsCount = await prisma.$queryRawTyped(
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
      const rawPrevValue: { prevValue: number | null }[] = await prisma.$queryRawTyped(
        getPrevAccountValue(accountId, new Date(previousPeriod.endDate)),
      );
      prevValue = (rawPrevValue[0].prevValue || 0) + Number(account.initialValue);

      const rawPrevIncome = await prisma.$queryRawTyped(
        getPrevTransactionsValueByAccount(
          accountId,
          new Date(previousPeriod.startDate),
          new Date(previousPeriod.endDate),
          'Income',
        ),
      );
      prevIncome = rawPrevIncome[0].prevValue || 0;

      const rawPrevExpenses = await prisma.$queryRawTyped(
        getPrevTransactionsValueByAccount(
          accountId,
          new Date(previousPeriod.startDate),
          new Date(previousPeriod.endDate),
          'Expense',
        ),
      );
      prevExpenses = rawPrevExpenses[0].prevValue || 0;
    }

    const chartData = await prisma.$queryRawTyped(
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

    const isRanged = startDateStr && startDateStr !== '' && endDateStr && endDateStr !== '';
    const previousPeriod = isRanged ? getPreviousPeriod(startDateStr, endDateStr) : null;

    if (localUser.id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const transactionsStartEndDate = await prisma.$queryRawTyped(getTransactionsStartEndDateByUser(userId));
    const transactionsStartDate = transactionsStartEndDate[0].min || new Date();
    transactionsStartDate.setDate(transactionsStartDate.getDate() - 1);
    const transactionsEndDate = transactionsStartEndDate[0].max || new Date();

    const rawGroupedTransactions = await prisma.$queryRawTyped(
      getGroupedTransactionsByUser(
        userId,
        previousPeriod && startDateStr ? new Date(startDateStr) : new Date('1900-01-01'),
        previousPeriod && endDateStr ? new Date(endDateStr) : new Date('9999-12-31'),
        page ? (parseInt(page) - 1) * 10 : 0,
      ),
    );
    const groupedTransactions: RawGroupedTransaction[] = JSON.parse(
      JSON.stringify(rawGroupedTransactions, (_, value) => (typeof value === 'bigint' ? value.toString() : value)),
    );

    const rawGroupedTransactionsCount = await prisma.$queryRawTyped(
      getTransactionsCountByUser(
        userId,
        previousPeriod && startDateStr ? new Date(startDateStr) : new Date('1900-01-01'),
        previousPeriod && endDateStr ? new Date(endDateStr) : new Date('9999-12-31'),
      ),
    );
    const groupedTransactionsCount = Number(rawGroupedTransactionsCount[0].count);

    const rawTotalAssetsInitialValue = await prisma.$queryRawTyped(getTotalAccountsInitialValue(userId, 'Asset'));
    const totalAssetsInitialValue = Number(rawTotalAssetsInitialValue[0].totalInitialValue);
    const rawTotalLiabilitiesInitialValue = await prisma.$queryRawTyped(
      getTotalAccountsInitialValue(userId, 'Liability'),
    );
    const totalLiabilitiesInitialValue = Number(rawTotalLiabilitiesInitialValue[0].totalInitialValue);

    let prevIncome = 0;
    let prevExpenses = 0;
    let prevAssetsValue = totalAssetsInitialValue;
    let prevLiabilitiesValue = totalLiabilitiesInitialValue;
    if (previousPeriod) {
      const rawPrevIncome = await prisma.$queryRawTyped(
        getPrevTransactionsValueByUser(
          userId,
          new Date(previousPeriod.startDate),
          new Date(previousPeriod.endDate),
          'Income',
        ),
      );
      prevIncome = rawPrevIncome[0].prevValue || 0;

      const rawPrevExpenses = await prisma.$queryRawTyped(
        getPrevTransactionsValueByUser(
          userId,
          new Date(previousPeriod.startDate),
          new Date(previousPeriod.endDate),
          'Expense',
        ),
      );
      prevExpenses = rawPrevExpenses[0].prevValue || 0;

      const rawPrevAssetsValue = await prisma.$queryRawTyped(
        getPrevAccountsValueByType(userId, 'Asset', new Date(previousPeriod.endDate)),
      );
      prevAssetsValue = totalAssetsInitialValue + (rawPrevAssetsValue[0].prevValue || 0);

      const rawPrevLiabilitiesValue = await prisma.$queryRawTyped(
        getPrevAccountsValueByType(userId, 'Liability', new Date(previousPeriod.endDate)),
      );
      prevLiabilitiesValue = totalLiabilitiesInitialValue + (rawPrevLiabilitiesValue[0].prevValue || 0);
    }

    const chartData = await prisma.$queryRawTyped(
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
            AND: {
              OR: [
                { userId },
                {
                  financialAccount: {
                    accountInvites: {
                      some: {
                        userId,
                        status: 'ACCEPTED',
                      },
                    },
                  },
                },
              ],
            },
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
        status: 'ACCEPTED',
        financialAccount: {
          userId: account?.userId,
        },
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
        status: 'ACCEPTED',
        financialAccount: {
          userId: account?.userId,
        },
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

    const incomeSumByCategoryQuery = prisma.$queryRawTyped(
      getTransactionsSumByCategory(
        localUser.id,
        'Income',
        previousPeriod && startDateStr ? new Date(startDateStr) : new Date('1900-01-01'),
        previousPeriod && endDateStr ? new Date(endDateStr) : new Date('9999-12-31'),
      ),
    );

    const expenseSumByCategoryQuery = prisma.$queryRawTyped(
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
