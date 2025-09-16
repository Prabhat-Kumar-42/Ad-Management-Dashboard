import jwt from 'jsonwebtoken';

// /server/utils/jwt.util.ts

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export function generateAccessToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

export function generateRefreshToken(payload: object){
    return jwt.sign(payload, JWT_SECRET, {expiresIn: "7d"})
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}