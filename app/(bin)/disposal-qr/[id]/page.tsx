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
  const isMulti = searchParams.multi === "true";
  const disposalIds = isMulti
    ? searchParams.ids?.split(",").filter(Boolean)
    : [searchParams.disposalId];

  const qrPayload = isMulti
    ? {
        multi: true,
        userId: params.id,
        disposalIds,
      }
    : {
        userId: params.id,
        disposalId: disposalIds[0],
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
