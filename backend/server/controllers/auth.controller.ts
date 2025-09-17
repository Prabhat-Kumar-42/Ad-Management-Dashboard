import type { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/auth.services.js';
import { BadRequestError } from '../utils/http-error.util.js';
import z from 'zod';
import { LoginUserSchema, RegisterUserSchema } from '../validators/auth.validator.js';
import { UserResponseSchema } from '../validators/user.validator.js';
import { oauthQuerySchema } from 'server/validators/oauth.validator.js';
import { oauthService } from 'server/services/oauth.services.js';

// /server/controllers/auth.controller.ts

export const register = async (req: Request, res: Response) => {
    const parsedBody = RegisterUserSchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw new BadRequestError('Validation error', z.treeifyError(parsedBody.error));
    }

    const { email, password } = parsedBody.data;

    const userDto = await registerUser(email, password);

    const userResponse = UserResponseSchema.parse(userDto);

    res.json(userResponse);
};

export const login = async (req: Request, res: Response) => {
    const parsedBody = LoginUserSchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw new BadRequestError('Validation error', z.treeifyError(parsedBody.error));
    }

    const { email, password } = parsedBody.data;

    const tokens = await loginUser(email, password);
    res.json(tokens);
};

export async function oauthGoogleCallbackLogin(req: Request, res: Response) {
  try {
    const parsed = oauthQuerySchema.parse(req.query);
    const tokens = await oauthService.handleGoogleLoginCallback(parsed.code);
    res.json(tokens);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function oauthMetaCallbackLogin(req: Request, res: Response) {
  try {
    const parsed = oauthQuerySchema.parse(req.query);
    const tokens = await oauthService.handleMetaLoginCallback(parsed.code);
    res.json(tokens);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
