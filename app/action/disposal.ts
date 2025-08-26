"use server";
import { HOSTED_URL } from "@/keys";
import { DisposalSchema } from "@/schemas";
import { cookies } from "next/headers";
import * as z from "zod";

type SingleInput = z.infer<typeof DisposalSchema>;
type BatchInput = Array<z.infer<typeof DisposalSchema>>;

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

type CreateDisposalResult =
  | {
      mode: "single";
      queueId: string;
      disposalId: string;
      point: number;
    }
  | {
      mode: "multi";
      queueId: string;
      disposalIds: string[];
      totalPoints: number;
      pointsPerItem?: number[];
    }
  | { error: string };

type DisposalCounts = {
  material: string;
  count: number;
};

export const createDisposal = async (
  values: SingleInput | BatchInput,
  userId: string
): Promise<CreateDisposalResult> => {
  const token = cookies().get("token");

  // Normalize to array and validate each with your existing schema
  const items = (Array.isArray(values) ? values : [values]).map((v) => {
    const ok = DisposalSchema.safeParse(v);
    if (!ok.success) throw new Error("Invalid fields!");
    return ok.data;
  });

  const res = await fetch(`${HOSTED_URL}/api/disposal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token?.value}`,
    },
    body: JSON.stringify({
      userId,
      items: items.map(({ material, weightInGrams }) => ({
        material,
        weightInGrams,
      })),
    }),
  });

  if (!res.ok) {
    const { message }: { message?: string } = await res.json().catch(() => ({}));
    return { error: message ?? "Failed to create disposal(s)." };
  }

  // Expected unified response from API:
  // {
  //   queueId: string,
  //   disposalIds: string[],
  //   totalPoints: number,
  //   pointsPerItem?: number[]
  // }
  const data = await res.json();

  if (!data?.queueId || !Array.isArray(data.disposalIds)) {
    return { error: "Malformed API response." };
  }

  if (data.disposalIds.length === 1) {
    return {
      mode: "single",
      queueId: data.queueId,
      disposalId: data.disposalIds[0],
      point:
        Array.isArray(data.pointsPerItem) && data.pointsPerItem.length > 0
          ? data.pointsPerItem[0]
          : data.totalPoints ?? 0,
    };
  }

  return {
    mode: "multi",
    queueId: data.queueId,
    disposalIds: data.disposalIds,
    totalPoints: data.totalPoints ?? 0,
    pointsPerItem: data.pointsPerItem,
  };
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
