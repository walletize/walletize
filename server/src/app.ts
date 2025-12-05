import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import express from 'express';
import { Lucia } from 'lucia';
import cron from 'node-cron';
import { verifyOrigin, verifySession } from './lib/midddleware.js';
import { updateCurrencyRates } from './lib/utils.js';
import routes from './routes/routes.js';

const env = process.env.NODE_ENV || 'development';

export const prisma = new PrismaClient();
const adapter = new PrismaAdapter(prisma.session, prisma.user);
export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: env === 'production' && process.env.USE_HTTPS === 'true',
    },
  },
  getUserAttributes: (attributes) => {
    return {
      email: attributes.email,
      name: attributes.name,
      mainCurrencyId: attributes.mainCurrencyId,
    };
  },
});

const corsOptions = {
  origin: process.env.WEB_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
};

const app = express();
app.use(cors(corsOptions));
app.use(verifyOrigin);
app.use(verifySession);
app.use(express.json());
app.use('/', routes);

app.listen(process.env.PORT || 3100, () => {
  console.info('Walletize Server started at ' + (process.env.PORT || 3100));
  console.info('Environment: ' + env);
});

if (env === 'production') {
  updateCurrencyRates();

  cron.schedule('0 0 * * *', () => {
    updateCurrencyRates();
  });
}
