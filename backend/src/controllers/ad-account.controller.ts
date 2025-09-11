import type { Response } from 'express';
import type { AuthRequest } from '../types/auth-request.type.js';
import { BadRequestError, UnauthorizedError } from '../utils/http-error.util.js';
import { adAccountService } from '../services/ad-account.service.js';
import { z } from 'zod';
import { adAccountParamsSchema } from '../validators/ad-account.validator.js';

// /src/controllers/ad-account.controller.ts

//  // GET /api/ad-accounts
export async function listAccounts(req: AuthRequest, res: Response) {
  if (!req.user) throw new UnauthorizedError();

  try {
    const accounts = await adAccountService.listAccounts(req.user.id);
    res.json({ accounts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch accounts' });
   }
}

// GET /api/ad-accounts/:id
export async function getAccount(req: AuthRequest, res: Response) {
  if (!req.user) throw new UnauthorizedError();

  const parseResult = adAccountParamsSchema.safeParse(req.params);
  if (!parseResult.success) {
    throw new BadRequestError('Validation error', z.treeifyError(parseResult.error));
  }

  try {
    const account = await adAccountService.getAccount(parseResult.data.id, req.user.id);
    res.json({ account });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch account' });
  }
}

// POST /api/ad-accounts/:id/refresh
export async function refreshAccount(req: AuthRequest, res: Response) {
  if (!req.user) throw new UnauthorizedError();

  const parseResult = adAccountParamsSchema.safeParse(req.params);
  if (!parseResult.success) {
    throw new BadRequestError('Validation error', z.treeifyError(parseResult.error));
  }

  try {
    const result = await adAccountService.refreshAccount(parseResult.data.id, req.user.id);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to refresh account' });
  }
}
