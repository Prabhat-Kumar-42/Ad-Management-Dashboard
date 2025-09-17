// /server/routes/account.routes.ts
import { Router } from 'express';
import { oauthGoogleConnect, oauthGoogleConnectCallback, oauthMetaConnect, oauthMetaConnectCallback } from 'server/controllers/account.controller.js';
import { authenticate } from 'server/middlewares/auth.middleware.js';

// /server/routes/account.routes.ts

export const accountRouter = Router();

accountRouter.get('/google', authenticate, oauthGoogleConnect);
accountRouter.get('/google/callback', authenticate, oauthGoogleConnectCallback);

accountRouter.get('/meta', authenticate, oauthMetaConnect);
accountRouter.get('/meta/callback', authenticate, oauthMetaConnectCallback);
