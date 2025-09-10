"use client";

import CardBody from "@/components/Card/CardBody";
import CardHeader from "@/components/Card/CardHeader";
import QrCard from "@/components/Card/QrCard";
import QrCodeComponent from "@/components/QrCode/QrImage";
import QrScanListener from "@/components/QrCode/QrScanListener";
import TimerRedirect from "@/components/TimerRedirect";

type PageProps = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

const QrCodePage = ({ params, searchParams }: PageProps) => {
  const queueId =
    typeof searchParams.queueId === "string" ? searchParams.queueId : undefined;

  // --- Debug logs ---
  console.group("[QrCodePage] Debug");
  console.log("userId:", params.id);
  console.log("queueId from URL:", queueId);
  console.groupEnd();

  if (!queueId) {
    console.warn("[QrCodePage] No queueId provided → redirecting to idle page");
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-red-700">
          Missing queue ID!
        </div>
        <div className="mt-4">
          <TimerRedirect
            redirectTo={`/idle-video/${params.id}`}
            delayInMs={3000}
          />
        </div>
      </div>
    );
  }

  const qrPayload = {
    userId: params.id,
    queueId,
  };

  // --- Log payload clearly ---
  console.group("[QrCodePage] QR Payload");
  console.log("Object:", qrPayload);
  console.log(`String → userId=${qrPayload.userId}, queueId=${qrPayload.queueId}`);
  console.groupEnd();

  return (
    <div className="flex flex-col items-center">
      <QrCard>
        <CardHeader>Scan the QR Code</CardHeader>
        <CardBody>
          {/* QR generated */}
          <QrCodeComponent payload={qrPayload} />
          {/* Scan listener */}
          <QrScanListener userId={params.id} queueId={queueId} />
        </CardBody>

        <TimerRedirect
          redirectTo={`/leaderboard/${params.id}`}
          delayInMs={30000}
        />
      </QrCard>
    </div>
  );
};

export default QrCodePage;
