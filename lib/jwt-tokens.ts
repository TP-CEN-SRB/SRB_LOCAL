import { NEXT_JWT_SECRET_KEY } from "@/keys";
import jwt from "jsonwebtoken";

type StandardQrPayload = {
  userId: string;
  queueId: string;
};

export const generateQrToken = (data: StandardQrPayload) => {
  return jwt.sign(data, NEXT_JWT_SECRET_KEY, { expiresIn: "1h" });
};