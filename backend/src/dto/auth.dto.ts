import { z } from 'zod';
import type { LoginUserSchema, RegisterUserSchema } from '../validators/auth.validator.js';

// /src/dto/auth.dto.ts

// DTO for Register User
export type RegisterUserDTO = z.infer<typeof RegisterUserSchema>;

// DTO for Login User
export type LoginUserDTO = z.infer<typeof LoginUserSchema>;