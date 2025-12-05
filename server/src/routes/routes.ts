import express from 'express';
import { isAuthenticated } from '../lib/midddleware.js';
import accounts from './accounts.js';
import auth from './auth.js';
import currencies from './currencies.js';
import transactions from './transactions.js';
import users from './users.js';

const router = express.Router();

router.use('/auth', auth);
router.use('/accounts', isAuthenticated, accounts);
router.use('/transactions', isAuthenticated, transactions);
router.use('/currencies', isAuthenticated, currencies);
router.use('/users', isAuthenticated, users);
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default router;
