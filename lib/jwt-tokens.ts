import { NEXT_JWT_SECRET_KEY } from "@/keys";
import jwt from "jsonwebtoken";

type QueueQrPayload = {
  queueId: string;  // Only queueId is embedded in the QR token
};

export const generateQrToken = (data: QueueQrPayload) => {
  return jwt.sign(data, NEXT_JWT_SECRET_KEY, {
    expiresIn: "1h",
  });
};
