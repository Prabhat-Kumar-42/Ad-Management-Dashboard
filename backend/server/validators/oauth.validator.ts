import z from 'zod'

// /server/validators/oauth.validator.ts

export const oauthQuerySchema = z.object({
   code: z.string().nonempty('Authorization code missing'),
});