import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface TokenPayload {
  id: number;
  email: string;
  name: string;
  role_id: number;
}

type JWTExpire = "1h" | "24h" | "7d";

/**
 * Generate JWT token
 */
export function generateToken(payload: TokenPayload, expiresIn: JWTExpire = "24h"): string {
  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn });
    return token;
  } catch (error) {
    throw new Error(`Failed to generate token: ${error}`);
  }
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Decode JWT token without verification
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.decode(token) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error("Token decode failed:", error);
    return null;
  }
}
