import type { metricsQuerySchema } from "../validators/metrics-query.validator.js";
import z from 'zod';

// /src/types/metric-query-params.type.ts

export type MetricsQueryParams = z.infer<typeof metricsQuerySchema>;