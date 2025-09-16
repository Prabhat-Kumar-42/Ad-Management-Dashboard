import bcrypt from 'bcrypt';
import { prisma } from '@shared/db/db.js';
import { BadRequestError, UnauthorizedError } from '../utils/http-error.util.js';
import { userModelToDTO } from '../utils/model-to-dto.js';
import { getSuccessTokens } from '../utils/helpers.util.js';

// /server/services/auth.services.js
export const registerUser = async (email: string, password: string) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new BadRequestError('User already exists', { email });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed
    }
  });

  return userModelToDTO(user);
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new UnauthorizedError('Invalid username or password');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new UnauthorizedError('Invalid username or password');

  return getSuccessTokens(user);
};
