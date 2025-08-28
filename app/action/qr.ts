"use server";

import { signQrToken } from "@/lib/jwt-tokens";

export async function generateQrServerToken(queueId: string) {
  if (!queueId) throw new Error("queueId required");
  return signQrToken({ queueId });
}
