import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { getAccount, listAccounts, refreshAccount } from '../controllers/ad-account.controller.js';

// /server/routes/ad-account.routes.ts

export const adAccountsRouter = Router();

adAccountsRouter.get('/', authenticate, listAccounts);
adAccountsRouter.get('/:id', authenticate, getAccount);
adAccountsRouter.post('/:id/refresh', authenticate, refreshAccount);

