import express from 'express';
import { prisma } from '../app.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const currencies = await prisma.currency.findMany({
      orderBy: [
        {
          code: 'asc',
        },
      ],
    });

    return res.status(200).json(currencies);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'internal_error' });
  }
});

export default router;
