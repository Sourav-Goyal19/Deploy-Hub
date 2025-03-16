import "dotenv/config";
import jwt from "jsonwebtoken";

export function generateAccessToken(payload: Record<string, string>) {
  return jwt.sign(payload, process.env.PRIVATE_KEY!, {
    algorithm: "RS256",
    expiresIn: "1m",
  });
}

export function generateRefreshToken(payload: Record<string, string>) {
  return jwt.sign(payload, process.env.PRIVATE_KEY!, {
    algorithm: "RS256",
    expiresIn: "7d",
  });
}

export function verifyJWT(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.PUBLIC_KEY!);
    return { payload: decoded, expired: false };
  } catch (error: any) {
    return { payload: null, expired: true };
  }
}
