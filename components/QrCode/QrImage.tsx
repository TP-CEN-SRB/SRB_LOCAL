import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { generateQrToken } from "@/lib/jwt-tokens";
import { getUnscannedDisposal } from "@/app/action/disposal";
import Image from "next/image";
import { getLoggedInUserById } from "@/app/action/user";
interface QRCodeComponentProps {
  disposalId: string;
  userId: string;
}
const QrCodeComponent = async ({
  disposalId,
  userId,
}: QRCodeComponentProps) => {
  const disposalData = await getUnscannedDisposal(disposalId);
  if (!disposalData || "error" in disposalData) {
    notFound();
  }
  const binManager = await getLoggedInUserById(userId);
  if (!binManager || "error" in binManager) {
    notFound();
  }
  const data = {
    disposalId: disposalData.id,
    userId: binManager.id,
    material: disposalData.bin.binMaterial.name,
    weightInGrams: disposalData.weightInGrams,
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
