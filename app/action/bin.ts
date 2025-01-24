"use server";
import { API_KEY, HOSTED_URL } from "@/keys";
import { revalidatePath } from "next/cache";

type Bin = {
  status: "FUNCTIONAL" | "UNDER_MAINTENANCE";
  currentCapacity: number;
  binMaterial: { name: string };
};

export const getBinByUserIdAndMaterial = async (
  id: string,
  material: string
) => {
  const res = await fetch(
    `${HOSTED_URL}/api/bin/user/${id}?material=${material}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
    }
  );
  if (res.status !== 200) {
    const { message }: { message: string } = await res.json();
    return { error: message };
  }
  const { bins }: { bins: Bin[] } = await res.json();
  // return the first bin
  return bins[0];
};

export const getBinsByUserId = async (id: string) => {
  revalidatePath("/bin-capacity");
  const res = await fetch(`${HOSTED_URL}/api/bin/user/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
  });
  if (res.status !== 200) {
    const { message }: { message: string } = await res.json();
    return { error: message };
  }
  const { bins }: { bins: Bin[] } = await res.json();
  return bins;
};
