import { hash, verify } from '@node-rs/argon2';
import express from 'express';
import { User } from 'lucia';
import { lucia, prisma } from '../app.js';
import { validateData } from '../lib/midddleware.js';
import { updatePasswordSchema, updateUserSchema } from '../lib/schemas/users.js';

const router = express.Router();

router.put('/currency/:currencyId', async (req, res) => {
  try {
    const localUser = res.locals.user as User;
    const currencyId = req.params.currencyId;

    await prisma.user.update({
      where: {
        id: localUser.id,
      },
      data: {
        mainCurrencyId: currencyId,
      },
    });

    return res.status(200).json({ message: 'success' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'internal_error' });
  }
});

router.put('/', validateData(updateUserSchema), async (req, res) => {
  try {
    const localUser = res.locals.user as User;
    const user = req.body;

    await prisma.user.update({
      where: {
        id: localUser.id,
      },
      data: user,
    });

    return res.status(200).json({ message: 'success' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'internal_error' });
  }
});

router.delete('/', async (req, res) => {
  try {
    const localUser = res.locals.user as User;

    await prisma.user.delete({
      where: {
        id: localUser.id,
      },
    });

    await lucia.invalidateSession(res.locals.session.id);
    const sessionCookie = lucia.createBlankSessionCookie().serialize();
    res.set('Set-Cookie', sessionCookie);

    return res.status(200).json({ message: 'success' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'internal_error' });
  }
});

router.put('/password', validateData(updatePasswordSchema), async (req, res) => {
  try {
    const localUser = res.locals.user as User;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        id: localUser.id,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'not_found' });
    }

    const validPassword = await verify(user.passwordHash || '', currentPassword, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
    if (!validPassword) {
      return res.status(401).json({ message: 'invalid_password' });
    }

    const passwordHash = await hash(newPassword, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    await prisma.user.update({
      where: {
        id: localUser.id,
      },
      data: {
        passwordHash,
      },
    });

    await lucia.invalidateUserSessions(localUser.id);
    const session = await lucia.createSession(localUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id).serialize();
    res.set('Set-Cookie', sessionCookie);

    return res.status(200).json({ message: 'success' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'internal_error' });
  }
});

export default router;
