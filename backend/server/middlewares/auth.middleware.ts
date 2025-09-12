import type { Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.util.js";
import type { AuthRequest } from "../types/auth-request.type.js";
import { UnauthorizedError } from "../utils/http-error.util.js";
import type { UserResponseDTO } from "../dto/user-response.dto.js";

// /server/middlewares/auth.middleware.ts

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError()
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new UnauthorizedError();
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded as UserResponseDTO;
    next();
  } catch (err) {
    next(err);
  }
}
