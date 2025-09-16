import z from 'zod';
import type { UserResponseSchema } from '../validators/user.validator.js';

// /server/dto/user-response.dto.ts

// DTO for User response (excluding sensitive data)
export type UserResponseDTO = z.infer<typeof UserResponseSchema>;
