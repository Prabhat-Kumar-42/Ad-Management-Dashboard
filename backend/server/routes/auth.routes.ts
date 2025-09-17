import { Router } from 'express';
import { register, login, oauthGoogleCallbackLogin, oauthMetaCallbackLogin } from '../controllers/auth.controller.js';
import { oauthGoogle, oauthMeta } from '../controllers/oauth.controller.js';

// /server/routes/auth.routes.ts
export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);

authRouter.get('/google/login', oauthGoogle);
authRouter.get('/google/callback', oauthGoogleCallbackLogin);

authRouter.get('/meta/login', oauthMeta);
authRouter.get('/meta/callback', oauthMetaCallbackLogin);