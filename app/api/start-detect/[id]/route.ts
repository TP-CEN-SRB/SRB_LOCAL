import { API_KEY } from "@/keys";
import { pusherServer } from "@/lib/pusher";
import { NextRequest, NextResponse } from "next/server";

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
    const { start } = await req.json();
    if (start !== true) {
      return NextResponse.json(
        { message: "Invalid start parameter" },
        { status: 400 }
      );
    }
    await pusherServer.trigger(`start-detect-${params.id}`, "start-update", {
      start,
    });
    return NextResponse.json(
      { message: "Starting detection" },
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
