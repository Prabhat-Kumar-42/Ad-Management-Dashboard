import type { Response } from 'express';
import { oauthService } from 'server/services/oauth.services.js';
import type { AuthRequest } from 'server/types/auth-request.type.js';
import { oauthQuerySchema } from 'server/validators/oauth.validator.js';

// /server/controllers/account.controller.ts

export async function oauthGoogleConnect(req: AuthRequest, res: Response) {
  try {
    const url = oauthService.getGoogleConnectUrl();
    res.redirect(url);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function oauthGoogleConnectCallback(req: AuthRequest, res: Response) {
  try {
    const parsed = oauthQuerySchema.parse(req.query);
    const result = await oauthService.handleGoogleConnectCallback(parsed.code, req.user!.id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function oauthMetaConnect(req: AuthRequest, res: Response) {
  try {
    const url = oauthService.getMetaConnectUrl();
    res.redirect(url);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function oauthMetaConnectCallback(req: AuthRequest, res: Response) {
  try {
    const parsed = oauthQuerySchema.parse(req.query);
    const result = await oauthService.handleMetaConnectCallback(parsed.code, req.user!.id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
