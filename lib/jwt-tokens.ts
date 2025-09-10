import jwt from "jsonwebtoken";
import { NEXT_JWT_SECRET_KEY } from "@/keys";

// Do not import this in client code directly
export function signQrToken(data: { queueId: string }) {
  return jwt.sign(data, NEXT_JWT_SECRET_KEY!, { expiresIn: "1h" });
}