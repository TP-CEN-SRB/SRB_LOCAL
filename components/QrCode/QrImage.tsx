import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { generateQrToken } from "@/lib/jwt-tokens";
import { getDisposal } from "@/app/action/disposal";
import Image from "next/image";

interface QrCodeComponentProps {
  payload: {
    userId: string;
    disposalId?: string;
    multi?: boolean;
    disposalIds?: string[];
  };
}

const QrCodeComponent = async ({ payload }: QrCodeComponentProps) => {
  const { userId, disposalId, multi, disposalIds } = payload;

  if (multi && disposalIds?.length) {
    const multiDisposals = await Promise.all(
      disposalIds.map(async (id) => {
        const res = await getDisposal(id);
        if ("error" in res) return null;
        return {
          disposalId: res.id,
          material: res.bin.binMaterial.name,
          weightInGrams: res.weightInGrams,
          pointsAwarded: res.pointsAwarded,
          carbonPrint: res.carbonprint, // ✅ added here
        };
      })
    );

    const filteredDisposals = multiDisposals.filter(
      (d): d is {
        disposalId: string;
        material: string;
        weightInGrams: number;
        pointsAwarded: number;
        carbonPrint: number;
      } => d !== null
    );
    if (filteredDisposals.length === 0) {
      notFound();
    }

    const token = generateQrToken({
      userId,
      multi: true,
      disposals: filteredDisposals,
    });

    const qrCodeUrl = await QRCode.toDataURL(token, {
      color: { light: "#f3fae1" },
    });

    return (
      <Image
        width="100"
        height="100"
        className="w-full bg-transparent"
        src={qrCodeUrl}
        alt="Multi-Disposal QR Code"
      />
    );
  }

  // ✅ Single disposal fallback
  if (!disposalId) notFound();

  const disposalData = await getDisposal(disposalId);
  if ("error" in disposalData) {
    notFound();
  }

  const token = generateQrToken({
    userId,
    multi: false,
    disposals: [
      {
        disposalId: disposalData.id,
        material: disposalData.bin.binMaterial.name,
        weightInGrams: disposalData.weightInGrams,
        pointsAwarded: disposalData.pointsAwarded,
        carbonPrint: disposalData.carbonprint, 
      },
    ],
  });

  const qrCodeUrl = await QRCode.toDataURL(token, {
    color: { light: "#f3fae1" },
  });

  return (
    <Image
      width="100"
      height="100"
      className="w-full bg-transparent"
      src={qrCodeUrl}
      alt="Single Disposal QR Code"
    />
  );
};

export default QrCodeComponent;
