import { NEXT_JWT_SECRET_KEY } from "@/keys";
import jwt from "jsonwebtoken";

type Disposal = {
  disposalId: string;
  material: string;
  weightInGrams: number;
  pointsAwarded: number;
  carbonPrint: number; 
};

type StandardQrPayload = {
  userId: string;
  multi: boolean;
  disposals: Disposal[];
};

export const generateQrToken = (data: StandardQrPayload) => {
  const token = jwt.sign(data, NEXT_JWT_SECRET_KEY, {
    expiresIn: "1h",
  });
  return token;
};
