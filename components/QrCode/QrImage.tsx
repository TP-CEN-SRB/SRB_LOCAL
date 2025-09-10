"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Image from "next/image";
import { notFound } from "next/navigation";
import { generateQrServerToken } from "@/app/action/qr";

interface QrCodeComponentProps {
  payload: {
    userId: string;
    queueId: string;
  };
}

const QrCodeComponent = ({ payload }: QrCodeComponentProps) => {
  const { userId, queueId } = payload;
  const [qrCodeUrl, setQrCodeUrl] = useState<string>();

  if (!queueId || !userId) notFound();

  useEffect(() => {
    const generateQr = async () => {
      try {
        const token = await generateQrServerToken(queueId);
        console.log("[QrCodeComponent] QR token:", token);

        const url = await QRCode.toDataURL(token, {
          color: { light: "#f3fae1" },
        });
        setQrCodeUrl(url);
      } catch (err) {
        console.error("Failed to generate QR code:", err);
      }
    };

    generateQr();
  }, [queueId, userId]);

  if (!qrCodeUrl) return <p className="text-slate-600">Generating QR code...</p>;

  return (
    <Image
      width={100}
      height={100}
      className="w-full bg-transparent"
      src={qrCodeUrl}
      alt="Disposal QR Code"
    />
  );
};

export default QrCodeComponent;
