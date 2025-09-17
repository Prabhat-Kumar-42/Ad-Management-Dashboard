import { Router } from 'express';
import { register, login, oauthGoogleCallbackLogin, oauthMetaCallbackLogin } from '../controllers/auth.controller.js';
import { oauthGoogle, oauthMeta } from '../controllers/oauth.controller.js';

// /server/routes/auth.routes.ts
export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);

authRouter.get('/oauth/google', oauthGoogle);
authRouter.get('/oauth/google/callback', oauthGoogleCallbackLogin);

authRouter.get('/oauth/meta', oauthMeta);
authRouter.get('/oauth/meta/callback', oauthMetaCallbackLogin);