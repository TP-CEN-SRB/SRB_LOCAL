import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";
export const POST = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const authorization = req.headers.get("x-api-key");
    if (authorization !== process.env.API_KEY) {
      return NextResponse.json(
        { message: "Permission denied!" },
        { status: 401 }
      );
    }

    const { material, weightInGrams, thrown } = await req.json();
    await pusherServer.trigger(
      `detect-material-${params.id}`,
      "material-details",
      {
        material,
        weightInGrams,
        thrown,
      }
    );
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
