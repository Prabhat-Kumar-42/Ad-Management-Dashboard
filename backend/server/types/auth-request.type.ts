import type { Request } from "express";
import type { UserResponseDTO } from "../dto/user-response.dto.js";

// /src/types/auth-request.type.ts
export interface AuthRequest extends Request {
  user?: UserResponseDTO;
}

