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

export const createDisposal = async (
  values: z.infer<typeof DisposalSchema>,
  userId: string
) => {
  // Check if user has permission
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
  // retrieve the disposalId and points awarded
  const { id, point }: { id: string; point: number } = await res.json();
  return { disposalId: id, point };
};

export const getUnscannedDisposal = async (id: string) => {
  const token = cookies().get("token");
  const res = await fetch(
    `${HOSTED_URL}/api/disposal/${id}?isRedeemed=${false}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token?.value}`,
      },
    }
  );
  if (res.status !== 200) {
    const { message }: { message: string } = await res.json();
    return { error: message };
  }
  const { disposal }: { disposal: Disposal } = await res.json();
  return disposal;
};
