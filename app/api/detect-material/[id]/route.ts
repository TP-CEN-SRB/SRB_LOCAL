import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";
import { getBinByUserIdAndMaterial } from "@/app/action/bin";
import { API_KEY, HOSTED_URL } from "@/keys";

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

    // 🔹 Always expect an array
    const disposals: {
      material: string;
      weightInGrams: number;
      thrown: boolean;
    }[] = await req.json();

    if (!Array.isArray(disposals) || disposals.length === 0) {
      return NextResponse.json(
        { message: "Invalid payload, must be a non-empty array" },
        { status: 400 }
      );
    }

    // 🔹 Step 1: Create or reuse a disposal queue
    const queueRes = await fetch(`${HOSTED_URL}/api/disposal/queue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({ userId: params.id }),
    });

    console.log("📩 [detect-material] /api/disposal/queue status:", queueRes.status);

    if (queueRes.status !== 200 && queueRes.status !== 201) {
      const { message } = await queueRes.json();
      console.error("❌ [detect-material] Queue creation/reuse failed:", message);
      return NextResponse.json(
        { message: message ?? "Queue creation failed" },
        { status: 500 }
      );
    }

    const { queue } = await queueRes.json();
    if (!queue) {
      console.error("❌ [detect-material] No queue returned");
      return NextResponse.json(
        { message: "Queue could not be created or reused" },
        { status: 500 }
      );
    }

    if (queueRes.status === 200) {
      console.log("♻️ [detect-material] Reused existing OPEN queue:", queue.id);
    } else if (queueRes.status === 201) {
      console.log("🆕 [detect-material] Created new queue:", queue.id);
    }

    // 🔹 Step 2: Broadcast to frontend with queueId included
    await pusherServer.trigger(
      `detect-material-${params.id}`,
      "material-details",
      {
        queueId: queue.id,
        disposals, // send entire list
      }
    );

    // 🔹 Step 3: Bin validations
    for (const { material, weightInGrams, thrown } of disposals) {
      const bin = await getBinByUserIdAndMaterial(params.id, material);

      if (!bin || "error" in bin) {
        console.error("❌ [detect-material] Bin not found for:", material);
        return NextResponse.json(
          { message: bin?.error ?? "Bin not found" },
          { status: 400 }
        );
      }
      if (bin.currentCapacity === 100) {
        console.warn(`⚠️ [detect-material] Bin full: ${bin.binMaterial.name}`);
        return NextResponse.json(
          { message: `${bin.binMaterial.name} bin is already full!` },
          { status: 400 }
        );
      }
      if (bin.status === "UNDER_MAINTENANCE") {
        console.warn(`⚠️ [detect-material] Bin under maintenance: ${bin.binMaterial.name}`);
        return NextResponse.json(
          { message: `${bin.binMaterial.name} bin is under maintenance!` },
          { status: 400 }
        );
      }

      if (weightInGrams && thrown === true) {
        continue; // let frontend handle disposal creation
      }
    }

    return NextResponse.json(
      { message: "Material details received", queueId: queue.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("💥 [detect-material] Error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 }
    );
  }
};
