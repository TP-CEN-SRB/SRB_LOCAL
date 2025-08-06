"use client";

import CardBody from "@/components/Card/CardBody";
import CardHeader from "@/components/Card/CardHeader";
import QrCard from "@/components/Card/QrCard";
import QrCodeComponent from "@/components/QrCode/QrImage";
import QrScanListener from "@/components/QrCode/QrScanListener";
import TimerRedirect from "@/components/TimerRedirect";

const QrCodePage = ({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string };
}) => {
  const queueId = searchParams.queueId;

  // ⚠️ If queueId is missing, render error or redirect
  if (!queueId) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-red-500">
        Missing queue ID!
      </div>
    );
  }

  const qrPayload = {
    userId: params.id,
    queueId, 
  };

  return (
    <div className="flex flex-col items-center">
      <QrCard>
        <CardHeader>Scan the QR Code</CardHeader>
        <CardBody>
          <QrCodeComponent payload={qrPayload} />
          <QrScanListener userId={params.id} />
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
