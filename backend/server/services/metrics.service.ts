import { prisma } from '@shared/db/db.js';
import type { MetricsQueryParams } from '../types/metric-query-params.type.js';

// /server/services/metrics.service.ts

export const metricsService = {
  async getMetrics(userId: string, query: MetricsQueryParams) {
    const filters: any = {
      accountId: query.accountId || undefined,
      platform: query.platform || undefined,
      date: {
        gte: query.startDate ? new Date(query.startDate) : undefined,
        lte: query.endDate ? new Date(query.endDate) : undefined,
      },
    };

    return await prisma.metricsDaily.groupBy({
      by: ['platform'],
      where: {
        ...filters,
        account: {
          userId,
        },
      },
      _sum: {
        impressions: true,
        clicks: true,
        spendMicros: true,
        conversions: true,
        videoViews: true,
      },
    });
  },

  async getMetricsBreakdown(userId: string, query: MetricsQueryParams) {
    const filters: any = {
      accountId: query.accountId || undefined,
      campaignId: query.campaignId || undefined,
      adGroupId: query.adGroupId || undefined,
      adId: query.adId || undefined,
      platform: query.platform || undefined,
      date: {
        gte: query.startDate ? new Date(query.startDate) : undefined,
        lte: query.endDate ? new Date(query.endDate) : undefined,
      },
    };

    return await prisma.metricsDaily.findMany({
      where: {
        ...filters,
        account: {
          userId,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  },
};
