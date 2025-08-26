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
    const { material, weightInGrams, thrown } = await req.json();
    const bin = await getBinByUserIdAndMaterial(params.id, material);
    await pusherServer.trigger(
      `detect-material-${params.id}`,
      "material-details",
      {
        material,
        weightInGrams,
        thrown,
      }
    );
    if (weightInGrams && thrown === true) {
      return NextResponse.json(
        { message: "Material details received" },
        { status: 200 }
      );
    }
    if (!bin || "error" in bin) {
      return NextResponse.json({ message: bin.error }, { status: 400 });
    }
    if (bin.currentCapacity === 100) {
      return NextResponse.json(
        { message: `${bin.binMaterial.name} bin is already full!` },
        { status: 400 }
      );
    }
    if (bin.status === "UNDER_MAINTENANCE") {
      return NextResponse.json(
        {
          message: `${bin.binMaterial.name} bin is under maintenance!`,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Material details received" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 }
    );
  }
};
