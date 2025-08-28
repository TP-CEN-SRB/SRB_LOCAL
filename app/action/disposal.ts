"use server";
import { API_KEY,HOSTED_URL } from "@/keys";
import { DisposalSchema } from "@/schemas";
import { cookies } from "next/headers";
import * as z from "zod";

type Disposal = {
  id: string;
  weightInGrams: number;
  binId: string;
  isRedeemed: boolean;
  pointsAwarded: number;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
  bin: {
    id: string;
    status: string;
    currentCapacity: number;
    userId: string;
    emailSent: boolean;
    binMaterialId: string;
    createdAt: Date;
    updatedAt: Date;
    binMaterial: {
      id: string;
      name: string;
    };
  };
};
type DisposalCounts = {
  material: string;
  count: number;
};

export const createDisposal = async (
  values: z.infer<typeof DisposalSchema>,
  userId: string,
  queueId: string
) => {
  const token = cookies().get("token");
  console.log("🍪 [createDisposal] Token from cookies:", token?.value);

  // validate input
  const validatedFields = DisposalSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  const { material, weightInGrams } = validatedFields.data;

  // Step 1: create disposal
  console.log("➡️ [createDisposal] Sending disposal request:", {
    userId,
    material,
    weightInGrams,
    authHeader: `Bearer ${token?.value}`,
  });

  const res = await fetch(`${HOSTED_URL}/api/disposal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token?.value}`,
    },
    body: JSON.stringify({ userId, material, weightInGrams }),
  });

  console.log("📩 [createDisposal] Response status from /api/disposal:", res.status);

  if (res.status !== 200 && res.status !== 201) {
    const { message }: { message: string } = await res.json();
    console.error("❌ [createDisposal] Error response:", message);
    return { error: message };
  }

  const disposalRes = await res.json();
  const { id, point } = disposalRes;
  console.log("✅ [createDisposal] Disposal created:", { id, point });

  // Step 2: attach disposal to queue
  console.log("➡️ [createDisposal] Attaching disposal to queue:", {
    queueId,
    disposalId: id,
    authHeader: `Bearer ${token?.value}`,
  });

  const attach = await fetch(`${HOSTED_URL}/api/disposal/queue`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token?.value}`,
    },
    body: JSON.stringify({ queueId, disposalId: id }),
  });

  const attachBody = await attach.json();
  console.log("📩 [createDisposal] Response from /queue attach:", {
    status: attach.status,
    body: attachBody,
  });

  if (attach.status !== 200) {
    console.error("❌ [createDisposal] Failed to attach:", attachBody.message);
    return { error: `Failed to attach disposal to queue: ${attachBody.message}` };
  }

  return { disposalId: id, point };
};

export const getDisposal = async (id: string) => {
  const token = cookies().get("token");
  console.log("🍪 [getDisposal] Token from cookies:", token?.value);

  const res = await fetch(`${HOSTED_URL}/api/disposal/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token?.value}`,
    },
  });

  console.log("📩 [getDisposal] Response status:", res.status);

  if (res.status !== 200) {
    const { message }: { message: string } = await res.json();
    console.error("❌ [getDisposal] Error:", message);
    return { error: message };
  }

  const { disposal }: { disposal: Disposal } = await res.json();
  return disposal;
};

export const getDisposals = async () => {
  const token = cookies().get("token");
  console.log("🍪 [getDisposals] Token from cookies:", token?.value);

  const res = await fetch(`${HOSTED_URL}/api/disposal/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token?.value}`,
    },
  });

  console.log("📩 [getDisposals] Response status:", res.status);

  if (res.status !== 200) {
    const { message }: { message: string } = await res.json();
    console.error("❌ [getDisposals] Error:", message);
    return { error: message };
  }

  const { disposals }: { disposals: DisposalCounts[] } = await res.json();
  return disposals;
};

export const closeQueue = async (queueId: string) => {
  const res = await fetch(`${HOSTED_URL}/api/disposal/queue/${queueId}/close`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
  });

  if (res.status !== 200) {
    const { message } = await res.json();
    return { error: message };
  }

  return { success: true };
};
