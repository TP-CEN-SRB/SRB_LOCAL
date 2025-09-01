import { cookies } from "next/headers";
import { HOSTED_URL } from "@/keys";
import IdleVideoClient from "@/components/Video/IdleVideoClient";

type BinCapacity = {
  material: string;
  percentage: number;
};

// --- Server-side fetch for bin capacities ---
const getBinCapacities = async (token: string, id: string): Promise<BinCapacity[]> => {
  const res = await fetch(`${HOSTED_URL}/api/bin-capacity/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const { message } = await res.json();
    throw new Error(message || "Failed to fetch bin capacities");
  }

  return await res.json();
};

// --- Server Component ---
const IdleVideoPage = async ({ params }: { params: { id: string } }) => {
  const token = cookies().get("token")?.value;
  if (!token) {
    return <div className="text-red-500">No token found. Please log in.</div>;
  }

  let capacities: BinCapacity[] = [];

  try {
    capacities = await getBinCapacities(token, params.id);
  } catch (error) {
    console.error("Failed to fetch bin capacities:", error);
  }

  // Hand off to client component that handles Pusher + redirect + video
  return <IdleVideoClient initialCapacities={capacities} id={params.id} />;
};

export default IdleVideoPage;
