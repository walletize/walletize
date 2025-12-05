import { InviteStatus } from '@prisma/client';
import { getAccount, getAccounts, getPrevAccountsValue } from '@prisma/client/sql';
import express from 'express';
import { User } from 'lucia';
import { prisma } from '../app.js';
import { ASSET_ID, LIABILITY_ID } from '../lib/constants.js';
import { validateData } from '../lib/midddleware.js';
import {
  accountCategorySchema,
  createAccountInviteSchema,
  createAccountSchema,
  updateAccountSchema,
} from '../lib/schemas/accounts.js';

const router = express.Router();

router.post('/', validateData(createAccountSchema), async (req, res) => {
  try {
    const localUser = res.locals.user as User;
    const { account, accountInvites } = req.body;

    if (localUser.id !== account.userId) {
      return res.status(403).json({ message: 'forbidden' });
    }

    const newAccount = await prisma.financialAccount.create({
      data: account,
    });

    for (const accountInvite of accountInvites) {
      const user = await prisma.user.findUnique({
        where: {
          email: accountInvite.email,
        },
      });

      await prisma.accountInvite.create({
        data: {
          status: InviteStatus.PENDING,
          email: accountInvite.email,
          userId: user?.id,
          accountId: newAccount.id,
        },
      });
    }
    return res.status(200).json({ message: 'success' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'internal_error' });
  }
});

router.get('/types', async (_req, res) => {
  try {
    const localUser = res.locals.user as User;

    const accountTypes = await prisma.accountType.findMany({
      include: {
        accountCategories: {
          where: {
            userId: localUser.id,
          },
          include: {
            _count: {
              select: { financialAccounts: true },
            },
          },
          orderBy: {
            name: 'asc',
          },
        },
      },
    });

    return res.status(200).json(accountTypes);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'internal_error' });
  }
});

router.get('/invites', async (_req, res) => {
  try {
    const localUser = res.locals.user as User;

    const rawAccountInvites = await prisma.accountInvite.findMany({
      where: {
        OR: [{ userId: localUser.id }, { email: localUser.email }],
        status: InviteStatus.PENDING,
      },
      include: {
        financialAccount: {
          include: {
            accountCategory: true,
            currency: true,
          },
        },
      },
    });
    const accountInvites = JSON.parse(
      JSON.stringify(rawAccountInvites, (_, value) => (typeof value === 'bigint' ? value.toString() : value)),
    );

    return res.status(200).json(accountInvites);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'internal_error' });
  }
});

router.post('/invites', validateData(createAccountInviteSchema), async (req, res) => {
  try {
    const localUser = res.locals.user as User;
    const accountInvite = req.body;

    const account = await prisma.financialAccount.findUnique({
      where: {
        id: accountInvite.accountId,
      },
    });
    if (!account) {
      return res.status(404).json({ message: 'not_found' });
    }
    if (localUser.id !== account.userId) {
      return res.status(403).json({ message: 'forbidden' });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: accountInvite.email,
      },
    });

    await prisma.accountInvite.create({
      data: {
        status: InviteStatus.PENDING,
        email: accountInvite.email,
        userId: user?.id || null,
        accountId: accountInvite.accountId,
      },
    });

    return res.status(200).json({ message: 'send_invite_success' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'internal_error' });
  }
});

router.delete('/invites/:inviteId', async (req, res) => {
  try {
    const localUser = res.locals.user as User;
    const inviteId = req.params.inviteId;

    const invite = await prisma.accountInvite.findUnique({
      where: {
        id: inviteId,
      },
      include: {
        financialAccount: true,
      },
    });
    if (!invite) {
      return res.status(404).json({ message: 'not_found' });
    }
    if (localUser.id !== invite.financialAccount.userId) {
      return res.status(403).json({ message: 'forbidden' });
    }

    await prisma.accountInvite.delete({
      where: {
        id: inviteId,
      },
    });

    return res.status(200).json({ message: 'delete_invite_success' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'internal_error' });
  }
});

router.post('/invites/:inviteId/accept', async (req, res) => {
  try {
    const localUser = res.locals.user as User;
    const inviteId = req.params.inviteId;

    const accountInvite = await prisma.accountInvite.findUnique({
      where: {
        id: inviteId,
      },
    });
    if (!accountInvite) {
      return res.status(404).json({ message: 'not_found' });
    }
    if (localUser.id !== accountInvite.userId && localUser.email !== accountInvite.email) {
      return res.status(403).json({ message: 'forbidden' });
    }

    await prisma.accountInvite.update({
      where: {
        id: inviteId,
      },
      data: {
        status: InviteStatus.ACCEPTED,
        userId: accountInvite.userId === null ? localUser.id : accountInvite.userId,
      },
    });

    return res.status(200).json({ message: 'accept_invite_success' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'internal_error' });
  }
});

router.post('/invites/:inviteId/decline', async (req, res) => {
  try {
    const localUser = res.locals.user as User;
    const inviteId = req.params.inviteId;

    const accountInvite = await prisma.accountInvite.findUnique({
      where: {
        id: inviteId,
      },
    });
    if (!accountInvite) {
      return res.status(404).json({ message: 'not_found' });
    }
    if (localUser.id !== accountInvite.userId && localUser.email !== accountInvite.email) {
      return res.status(403).json({ message: 'forbidden' });
    }

    await prisma.accountInvite.delete({
      where: {
        id: inviteId,
      },
    });

    return res.status(200).json({ message: 'decline_invite_success' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'internal_error' });
  }
});

router.post('/invites/:accountId/leave', async (req, res) => {
  try {
    const localUser = res.locals.user as User;
    const accountId = req.params.accountId;

    const accountInvite = await prisma.accountInvite.findFirst({
      where: {
        userId: localUser.id,
        accountId,
      },
    });
    if (!accountInvite) {
      return res.status(404).json({ message: 'not_found' });
    }
    if (localUser.id !== accountInvite.userId) {
      return res.status(403).json({ message: 'forbidden' });
    }

    await prisma.accountInvite.delete({
      where: {
        id: accountInvite.id,
      },
    });

    return res.status(200).json({ message: 'leave_account_success' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'internal_error' });
  }
});

router.get('/user', async (req, res) => {
  try {
    const localUser = res.locals.user as User;
    const startDate = req.query.startDate as string;

    const rawAccounts = await prisma.$queryRawTyped(getAccounts(localUser.id));
    const accounts = JSON.parse(
      JSON.stringify(rawAccounts, (_, value) => (typeof value === 'bigint' ? value.toString() : value)),
    );

    let prevAssetsValue = 0;
    let prevLiabilitiesValue = 0;
    if (startDate) {
      const prevAssetsValueQuery = await prisma.$queryRawTyped(
        getPrevAccountsValue('Asset', localUser.id, new Date(startDate)),
      );
      const prevLiabilitiesValueQuery = await prisma.$queryRawTyped(
        getPrevAccountsValue('Liability', localUser.id, new Date(startDate)),
      );

      prevAssetsValue = prevAssetsValueQuery[0].prevValue ? prevAssetsValueQuery[0].prevValue : 0;
      prevLiabilitiesValue = prevLiabilitiesValueQuery[0].prevValue ? prevLiabilitiesValueQuery[0].prevValue : 0;
    }

    const assetsInitialValues = await prisma.financialAccount.aggregate({
      _sum: {
        initialValue: true,
      },
      where: {
        accountCategory: {
          accountType: {
            id: ASSET_ID,
          },
        },
      },
    });

    const liabilitiesInitialValues = await prisma.financialAccount.aggregate({
      _sum: {
        initialValue: true,
      },
      where: {
        accountCategory: {
          accountType: {
            id: LIABILITY_ID,
          },
        },
      },
    });

    return res.status(200).json({
      accounts,
      prevAssetsValue,
      prevLiabilitiesValue,
      assetsInitialValues: Number(assetsInitialValues._sum.initialValue),
      liabilitiesInitialValues: Number(liabilitiesInitialValues._sum.initialValue),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'internal_error' });
  }
});

router.get('/:accountId', async (req, res) => {
  try {
    const localUser = res.locals.user as User;
    const accountId = req.params.accountId;

    const accountData = await prisma.financialAccount.findUnique({
      include: {
        accountInvites: {
          where: {
            userId: localUser.id,
            status: InviteStatus.ACCEPTED,
          },
        },
      },
      where: {
        id: accountId,
      },
    });
    if (!accountData) {
      return res.status(404).json({ message: 'not_found' });
    }
    if (localUser.id !== accountData.userId && accountData.accountInvites.length === 0) {
      return res.status(403).json({ message: 'forbidden' });
    }

    const rawAccount = await prisma.$queryRawTyped(getAccount(accountId));
    const account = JSON.parse(
      JSON.stringify(rawAccount[0], (_, value) => (typeof value === 'bigint' ? value.toString() : value)),
    );

    return res.status(200).json(account);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'internal_error' });
  }
});

router.put('/:accountId', validateData(updateAccountSchema), async (req, res) => {
  try {
    const localUser = res.locals.user as User;
    const accountId = req.params.accountId;
    const updatedAccount = req.body;

    const account = await prisma.financialAccount.findUnique({
      where: {
        id: accountId,
      },
    });
    if (!account) {
      return res.status(404).json({ message: 'not_found' });
    }
    if (localUser.id !== account.userId) {
      return res.status(403).json({ message: 'forbidden' });
    }

    await prisma.financialAccount.update({
      where: {
        id: accountId,
      },
      data: updatedAccount,
    });

    return res.status(200).json({ message: 'success' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'internal_error' });
  }
});

router.delete('/:accountId', async (req, res) => {
  try {
    const localUser = res.locals.user as User;
    const accountId = req.params.accountId;

    const account = await prisma.financialAccount.findUnique({
      where: {
        id: accountId,
      },
    });
    if (!account) {
      return res.status(404).json({ message: 'not_found' });
    }
    if (localUser.id !== account.userId) {
      return res.status(403).json({ message: 'forbidden' });
    }

    await prisma.financialAccount.delete({
      where: {
        id: accountId,
      },
    });

    return res.status(200).json({ message: 'success' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'internal_error' });
  }
});

router.post('/categories', validateData(accountCategorySchema), async (req, res) => {
  try {
    const localUser = res.locals.user as User;
    const category = req.body;

    await prisma.accountCategory.create({
      data: {
        name: category.name,
        typeId: category.typeId,
        userId: localUser.id,
      },
    });

    return res.status(200).json({ message: 'success' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'internal_error' });
  }
});

router.put('/categories/:categoryId', validateData(accountCategorySchema), async (req, res) => {
  try {
    const localUser = res.locals.user as User;
    const categoryId = req.params.categoryId;
    const updatedCategory = req.body;

    const category = await prisma.accountCategory.findUnique({
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

    await prisma.accountCategory.update({
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

    const category = await prisma.accountCategory.findUnique({
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

    const existingCategoryCount = await prisma.accountCategory.count({
      where: {
        userId: category.userId,
        typeId: category.typeId,
      },
    });
    if (existingCategoryCount === 1) {
      return res.status(400).json({ message: 'category_cannot_be_empty' });
    }

    await prisma.accountCategory.delete({
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

export default router;
