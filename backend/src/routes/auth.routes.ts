import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { oauthGoogle, oauthGoogleCallback, oauthMeta, oauthMetaCallback } from '../controllers/oauth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

// /src/routes/auth.routes.ts
export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);

authRouter.get('/oauth/google', oauthGoogle);
authRouter.get('/oauth/google/callback', authenticate, oauthGoogleCallback);

authRouter.get('/oauth/meta', oauthMeta);
authRouter.get('/oauth/meta/callback', authenticate, oauthMetaCallback);



