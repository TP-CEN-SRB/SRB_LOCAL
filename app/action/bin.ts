"use server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

type Bin = {
  status: "FUNCTIONAL" | "UNDER_MAINTENANCE";
  currentCapacity: number;
  binMaterial: { name: string };
};

export const getBinByUserIdAndMaterial = async (
  id: string,
  material: string
) => {
  const token = cookies().get("token");
  const res = await fetch(
    `${process.env.HOSTED_URL}/api/bin/user/${id}?material=${material}`,
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
  const { bins }: { bins: Bin[] } = await res.json();
  // return the first bin
  return bins[0];
};

export const getBinsByUserId = async () => {
  const token = cookies().get("token");
  const payload = jwt.decode(token?.value as string);
  const id =
    payload && typeof payload !== "string" ? payload.userId : undefined;
  const res = await fetch(`${process.env.HOSTED_URL}/api/bin/user/${id}`, {
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
  const { bins }: { bins: Bin[] } = await res.json();
  return bins;
};
