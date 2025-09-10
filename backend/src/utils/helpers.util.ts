import type { User } from "@prisma/client";
import { userModelToDTO } from "./model-to-dto.js";
import { generateAccessToken, generateRefreshToken } from "./jwt.util.js";

export const getSuccessTokens = (user: User) => {
  const userDTO = userModelToDTO(user);
  const accessToken = generateAccessToken(userDTO);
  const refreshToken = generateRefreshToken(userDTO);
  return { accessToken, refreshToken };
};

