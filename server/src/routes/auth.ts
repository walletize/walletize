import { hash, verify } from '@node-rs/argon2';
import express from 'express';
import { User } from 'lucia';
import { lucia, prisma } from '../app.js';
import { validateData } from '../lib/midddleware.js';
import { loginSchema, signupSchema } from '../lib/schemas/auth.js';
import { seedAccountCategories } from '../prisma/seeders/accountCategories.js';
import { seedUserTransactionCategories } from '../prisma/seeders/transactionCategory.js';

const router = express.Router();

router.post('/signup', validateData(signupSchema), async (req, res) => {
  try {
    const user = req.body;

    const existingUser = await prisma.user.findUnique({
      where: {
        email: user.email,
      },
    });
    if (existingUser) {
      return res.status(400).json({ message: 'email_taken' });
    }

    const passwordHash = await hash(user.password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    const newUser = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        passwordHash,
      },
    });

    await Promise.all([seedAccountCategories(prisma, newUser.id), seedUserTransactionCategories(prisma, newUser.id)]);

    const session = await lucia.createSession(newUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id).serialize();
    res.set('Set-Cookie', sessionCookie);

    return res.status(200).json({ message: 'signup_successful' });
  } catch {
    return res.status(500).json({ message: 'internal_error' });
  }
});

router.post('/login', validateData(loginSchema), async (req, res) => {
  try {
    const user = req.body;

    const existingUser = await prisma.user.findUnique({
      where: {
        email: user.email,
      },
    });
    if (!existingUser) {
      return res.status(400).json({ message: 'incorrect_credentials' });
    }

    const validPassword = await verify(existingUser.passwordHash || '', user.password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
    if (!validPassword) {
      return res.status(400).json({ message: 'incorrect_credentials' });
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id).serialize();
    res.set('Set-Cookie', sessionCookie);

    return res.status(200).json({ message: 'success' });
  } catch {
    return res.status(500).json({ message: 'internal_error' });
  }
});

router.get('/session/validate', async (_req, res) => {
  try {
    if (res.locals.user) {
      const localUser = res.locals.user as User;
      const userData = await prisma.user.findUnique({
        select: {
          email: true,
          name: true,
          mainCurrencyId: true,
          id: true,
          passwordHash: true,
        },
        where: {
          id: localUser.id,
        },
      });

      const user = {
        ...userData,
        hasPassword: !!userData?.passwordHash,
      };

      return res.status(200).json(user);
    }

    return res.status(200).json(null);
  } catch {
    return res.status(500).json({ message: 'internal_error' });
  }
});

router.post('/logout', async (_req, res) => {
  try {
    if (!res.locals.session) {
      return res.status(401).end();
    }

    await lucia.invalidateSession(res.locals.session.id);
    const sessionCookie = lucia.createBlankSessionCookie().serialize();
    res.set('Set-Cookie', sessionCookie);

    return res.status(200).json({ message: 'logout_successful' });
  } catch {
    return res.status(500).json({ message: 'internal_error' });
  }
});

export default router;
