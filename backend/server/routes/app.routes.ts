import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { adAccountsRouter } from "./ad-account.routes.js";
import { metricsRouter } from "./metrics.route.js";
import { campaignRouter } from "./campaign.route.js";
import { accountRouter } from "./accounts.routes.js";

// /server/routes/app.routes.ts

export const appRouter = Router();

appRouter.use('/auth', authRouter);
appRouter.use('/connect-account', accountRouter);
appRouter.use('/ad-accounts', adAccountsRouter);
appRouter.use('/metrics', metricsRouter);
appRouter.use('/campaigns', campaignRouter);
