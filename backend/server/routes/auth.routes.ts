import { Router } from "express";
import {
  register,
  login,
  oauthGoogleCallbackLogin,
  oauthMetaCallbackLogin,
  oauthGoogleLogin,
  oauthMetaLogin,
} from "../controllers/auth.controller.js";

// /server/routes/auth.routes.ts
export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);

authRouter.get("/google/login", oauthGoogleLogin);
authRouter.get("/google/callback", oauthGoogleCallbackLogin);

authRouter.get("/meta", oauthMetaLogin);
authRouter.get("/meta/callback", oauthMetaCallbackLogin);
