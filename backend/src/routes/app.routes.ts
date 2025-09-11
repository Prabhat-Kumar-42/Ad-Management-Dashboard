import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { adAccountsRouter } from "./ad-account.routes.js";
import { metricsRouter } from "./metrics.route.js";

// /src/routes/app.routes.ts

export const appRouter = Router();

appRouter.use('/auth', authRouter);
appRouter.use('/ad-accounts', adAccountsRouter);
appRouter.use('/metrics', metricsRouter);

