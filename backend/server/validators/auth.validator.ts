import { z } from 'zod';

// /server/validators/auth.validator.ts

// Schema for Register User
export const RegisterUserSchema = z.object({
  email: z.email().min(1, "Email is required"),
  password: z.string().min(8, "Password should have at least 8 characters"),
});

// Schema for Login User
export const LoginUserSchema = z.object({
  email: z.email().min(1, "Email is required"),
  password: z.string().min(8, "Password should have at least 8 characters"),
});

