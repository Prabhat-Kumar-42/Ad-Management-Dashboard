import type { metricsQuerySchema } from "../validators/metrics-query.validator.js";
import z from 'zod';

// /server/types/metric-query-params.type.ts

export type MetricsQueryParams = z.infer<typeof metricsQuerySchema>;