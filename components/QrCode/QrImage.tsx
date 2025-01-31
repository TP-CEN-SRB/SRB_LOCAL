import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { generateQrToken } from "@/lib/jwt-tokens";
import { getDisposal } from "@/app/action/disposal";
import Image from "next/image";
interface QRCodeComponentProps {
  disposalId: string;
  userId: string;
}
const QrCodeComponent = async ({
  disposalId,
  userId,
}: QRCodeComponentProps) => {
  const disposalData = await getDisposal(disposalId);
  if ("error" in disposalData) {
    notFound();
  }
  const data = {
    disposalId: disposalData.id,
    userId: userId,
    material: disposalData.bin.binMaterial.name,
    weightInGrams: disposalData.weightInGrams,
    pointsAwarded: disposalData.pointsAwarded,
  };
  const token = generateQrToken(data);
  const qrCodeUrl = await QRCode.toDataURL(token, {
    color: {
      light: "#f3fae1",
    },
  });

  return (
    <Image
      width="100"
      height="100"
      className="w-full bg-transparent"
      src={qrCodeUrl}
      alt="Generated QR Code"
    />
  );
};

export default QrCodeComponent;
