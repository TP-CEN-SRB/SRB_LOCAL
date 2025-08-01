import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";
import { getBinByUserIdAndMaterial } from "@/app/action/bin";
import { API_KEY } from "@/keys";

export const POST = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const authorization = req.headers.get("x-api-key");
    if (authorization !== API_KEY) {
      return NextResponse.json(
        { message: "Permission denied!" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const detections = Array.isArray(body)
      ? body
      : [body]; // support both single and multi

    for (const { material, weightInGrams, thrown } of detections) {
      if (!material) continue;

      const bin = await getBinByUserIdAndMaterial(params.id, material);
      if (!bin || "error" in bin) continue;
      if (bin.currentCapacity === 100 || bin.status === "UNDER_MAINTENANCE")
        continue;

      await pusherServer.trigger(`detect-material-${params.id}`, "material-details", {
        material,
        weightInGrams,
        thrown,
      });
    }

    return NextResponse.json(
      { message: "All material details processed" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
};

