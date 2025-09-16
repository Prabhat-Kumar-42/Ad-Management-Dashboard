import { prisma } from '@shared/db/db.js';
import { NotFoundError } from '../utils/http-error.util.js';

// /server/services/ad-account.service.ts

export const adAccountService = {
  async listAccounts(userId: string) {
    return await prisma.adAccount.findMany({
      where: { userId },
      select: {
        id: true,
        platform: true,
        externalId: true,
        name: true,
        currency: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async getAccount(accountId: string, userId: string) {
    const account = await prisma.adAccount.findFirst({
      where: {
        id: accountId,
        userId,
      },
      select: {
        id: true,
        platform: true,
        externalId: true,
        name: true,
        currency: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!account) {
      throw new NotFoundError('Account not found');
    }

    return account;
  },

  async refreshAccount(accountId: string, userId: string) {
    const account = await prisma.adAccount.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new NotFoundError('Account not found');
    }

    // TODO: Trigger refresh job here

    return { message: 'Refresh job triggered', accountId };
  },
};
