import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { generateQrToken } from "@/lib/jwt-tokens";
import Image from "next/image";

interface QrCodeComponentProps {
  payload: {
    userId: string;
    queueId: string;
  };
}

const QrCodeComponent = async ({ payload }: QrCodeComponentProps) => {
  const { userId, queueId } = payload;

  if (!queueId || !userId) {
    notFound(); // 🛑 If either is missing, something is wrong
  }

  const token = generateQrToken({
    queueId,
  });

  const qrCodeUrl = await QRCode.toDataURL(token, {
    color: { light: "#f3fae1" }, // pastel-green background
  });

  return (
    <Image
      width="100"
      height="100"
      className="w-full bg-transparent"
      src={qrCodeUrl}
      alt="Disposal QR Code"
    />
  );
};

export default QrCodeComponent;
