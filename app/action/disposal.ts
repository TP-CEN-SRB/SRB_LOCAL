"use server";

import { HOSTED_URL } from "@/keys";
import { DisposalSchema } from "@/schemas";
import { cookies } from "next/headers";
import * as z from "zod";

type Disposal = {
  id: string;
  weightInGrams: number;
  binId: string;
  isRedeemed: boolean;
  pointsAwarded: number;
  carbonprint: number; 
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
  userId: string
) => {
  const token = cookies().get("token");
  const validatedFields = DisposalSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  const { material, weightInGrams } = validatedFields.data;

  const res = await fetch(`${HOSTED_URL}/api/disposal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token?.value}`,
    },
    body: JSON.stringify({ userId, material, weightInGrams }),
  });

  if (res.status !== 200) {
    const { message }: { message: string } = await res.json();
    return { error: message };
  }

  const { id, point }: { id: string; point: number } = await res.json();
  return { disposalId: id, point };
};

export const createMultiDisposal = async (
  payloads: Array<z.infer<typeof DisposalSchema>>,
  userId: string
) => {
  const token = cookies().get("token");

  const res = await fetch(`${HOSTED_URL}/api/disposal/multi`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token?.value}`,
    },
    body: JSON.stringify({ userId, disposals: payloads }),
  });

  if (res.status !== 200) {
    const { message }: { message: string } = await res.json();
    return { error: message };
  }

  const { records, totalPoints }: { records: { id: string }[]; totalPoints: number } = await res.json();
  const disposalIds = records.map((d) => d.id);

  return { disposalIds, totalPoints };
};

export const getDisposal = async (id: string) => {
  const token = cookies().get("token");

  const res = await fetch(`${HOSTED_URL}/api/disposal/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token?.value}`,
    },
  });

  if (res.status !== 200) {
    const { message }: { message: string } = await res.json();
    return { error: message };
  }

  const { disposal }: { disposal: Disposal } = await res.json();
  if (!disposal) {
    return { error: "Disposal not found" };
  }

  if (disposal.isRedeemed === true) {
    return { error: "This disposal has already been redeemed!" };
  }

  return disposal;
};

export const getDisposals = async () => {
  const token = cookies().get("token");

  const res = await fetch(`${HOSTED_URL}/api/disposal/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token?.value}`,
    },
  });

  if (res.status !== 200) {
    const { message }: { message: string } = await res.json();
    return { error: message };
  }

  const { disposals }: { disposals: DisposalCounts[] } = await res.json();
  return disposals;
};
