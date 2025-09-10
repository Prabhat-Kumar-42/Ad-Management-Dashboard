import z from 'zod';

// /src/validators/user.validator.ts

export const UserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  createdAt: z.date(),
});

