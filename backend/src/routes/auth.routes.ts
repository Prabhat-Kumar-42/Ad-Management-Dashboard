import { Router } from 'express';
import { register, login, oauthGoogle, oauthMeta } from '../controllers/auth.controller.js';

// /src/routes/auth.routes.ts
export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);

// OAuth placeholders
authRouter.get('/oauth/google', oauthGoogle);
authRouter.get('/oauth/meta', oauthMeta);

