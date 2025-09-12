import type { Request, Response } from 'express';
import type { AuthRequest } from '../types/auth-request.type.js';
import { BadRequestError, UnauthorizedError } from '../utils/http-error.util.js';
import { oauthService } from '../services/oauth.services.js';
import { oauthQuerySchema } from '../validators/oauth.validator.js';
import { z } from 'zod';

// /src/controllers/oauth.controller.ts

// Google: Redirect to Google OAuth
export function oauthGoogle(req: Request, res: Response) {
  const url = oauthService.getGoogleAuthUrl();
  res.redirect(url);
}

// Google: Callback
export async function oauthGoogleCallback(req: AuthRequest, res: Response) {
  const parseResult = oauthQuerySchema.safeParse(req.query);
  if (!parseResult.success) {
    throw new BadRequestError('Validation error', z.treeifyError(parseResult.error));
  }

  if (!req.user) throw new UnauthorizedError();

  try {
    await oauthService.handleGoogleCallback(parseResult.data.code, req.user.id);
    res.json({ message: 'Google account connected successfully' });
  } catch (err) {
    console.error('Google OAuth error:', err);
    res.status(500).json({ error: 'Google OAuth failed' });
  }
}

// Meta: Redirect to Meta OAuth
export function oauthMeta(req: Request, res: Response) {
  const url = oauthService.getMetaAuthUrl();
  res.redirect(url);
}

// Meta: Callback
export async function oauthMetaCallback(req: AuthRequest, res: Response) {
  const parseResult = oauthQuerySchema.safeParse(req.query);
  if (!parseResult.success) {
    throw new BadRequestError('Validation error', z.treeifyError(parseResult.error));
  }

  if (!req.user) throw new UnauthorizedError();

  try {
    await oauthService.handleMetaCallback(parseResult.data.code, req.user.id);
    res.json({ message: 'Meta account connected successfully' });
  } catch (err) {
    console.error('Meta OAuth error:', err);
    res.status(500).json({ error: 'Meta OAuth failed' });
  }
}
