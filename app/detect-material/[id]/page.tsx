"use client";
import { useState, useEffect } from "react";
import { FadeLoader, RingLoader } from "react-spinners";
import Card from "@/components/Card/Card";
import CardHeader from "@/components/Card/CardHeader";
import CardBody from "@/components/Card/CardBody";
import { useRouter } from "next/navigation";
import { BeatLoader } from "react-spinners";
import { createDisposal } from "@/app/action/disposal";
import TimerRedirect from "@/components/TimerRedirect";
import { pusherClient } from "@/lib/pusher";
import { getBinByUserIdAndMaterial } from "@/app/action/bin";
import MaterialVideoStream from "@/components/Video/MaterialVideoStream";

const DetectMaterialPage = ({ params }: { params: { id: string } }) => {
  const [detecting, setDetecting] = useState(true);
  const [material, setMaterial] = useState("");
  const [weightInGrams, setWeightInGrams] = useState<number>();
  const [resetCondition, setResetCondition] = useState(false);

  const [error, setError] = useState<string>();
  const [thrown, setThrown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkIfBinIsInOrder = async () => {
      if (material) {
        const bin = await getBinByUserIdAndMaterial(params.id, material);
        if (!bin || "error" in bin) {
          setDetecting(false);
          setError(bin.error);
          return;
        }
        if (bin.currentCapacity === 100) {
          setDetecting(false);
          setError(`${bin.binMaterial.name} bin is already full!`);
          return;
        }
        if (bin.status === "UNDER_MAINTENANCE") {
          setDetecting(false);
          setError(`${bin.binMaterial.name} bin is under maintenance!`);
          return;
        }
      }
    };
    checkIfBinIsInOrder();
  }, [params.id, material]);
  useEffect(() => {
    const handleDisposal = async () => {
      if (thrown === true && material && weightInGrams) {
        const disposalId = await createDisposal(
          {
            material,
            weightInGrams,
          },
          params.id
        );
        if (typeof disposalId === "object" && "error" in disposalId) {
          setError(disposalId.error);
        } else {
          router.push(`/disposal-qr/${params.id}?disposalId=${disposalId}`);
        }
      }
    };

    handleDisposal();
  }, [thrown, material, params.id, router, weightInGrams]);

  /**
   *Pusher
   */
  useEffect(() => {
    pusherClient.subscribe(`detect-material-${params.id}`);
    pusherClient.bind(
      "material-details",
      (data: { material: string; weightInGrams: number; thrown: boolean }) => {
        if (
          data.thrown === undefined &&
          data.material &&
          data.weightInGrams === undefined
        ) {
          setMaterial(data.material.toUpperCase() as string);
          setDetecting(false);
          setResetCondition(true);
        }
        if (
          material &&
          data.weightInGrams !== undefined &&
          data.thrown === true
        ) {
          setWeightInGrams(data.weightInGrams);
          setThrown(data.thrown);
        }
      }
    );
    return () => {
      pusherClient.unbind("material-details");
      pusherClient.unsubscribe(`detect-material-${params.id}`);
    };
  }, [material, weightInGrams, thrown, params.id, router]);

  return (
    <div className="flex w-screen h-screen bg-center bg-[var(--pastel-green)]">
      <div className="flex-1 h-full w-full border-l border-black">
        <MaterialVideoStream />
      </div>
      <div className="flex flex-col flex-1">
        <div className="flex-1 border-l border-b border-black">
          <Card fullHeight centered>
            <div className="flex flex-col items-center justify-center gap-y-3 mb-6">
              <CardHeader>Material Detection</CardHeader>
              {detecting && <FadeLoader color="#22c55e" />}
            </div>
            <CardBody>
              {detecting ? (
                <p className="text-slate-600 text-center text-lg">
                  Detecting the material of your item...
                </p>
              ) : !error ? (
                <div className="text-center space-y-6">
                  <h2 className="text-3xl font-bold text-green-500">
                    {material} Detected
                  </h2>
                  <p className="text-slate-600">
                    Please dispose the item in the opened bin.
                  </p>
                </div>
              ) : (
                <p className="text-slate-600 text-center text-lg">{error}</p>
              )}
            </CardBody>
            {!detecting && !error && (
              <div className="flex flex-col items-center justify-center mt-4">
                <BeatLoader color="#22c55e" />
                {thrown && weightInGrams && (
                  <p className="text-slate-600">Generating your qr code...</p>
                )}
              </div>
            )}
            {error && (
              <TimerRedirect
                delayInMs={3000}
                redirectTo={`/idle-video/${params.id}`}
              />
            )}
            {!error && !thrown && weightInGrams === undefined && (
              <TimerRedirect
                delayInMs={60000}
                resetTimeInMs={30000}
                resetCondition={resetCondition}
                redirectTo={`/idle-video/${params.id}`}
              />
            )}
          </Card>
        </div>
        <div className="flex-1 border-l border-b border-black">
          <Card centered fullHeight>
            <div className="flex items-center justify-center mb-6 gap-x-3">
              <CardHeader>Recycling Steps</CardHeader>
              <RingLoader color="#22c55e" />
            </div>
            <CardBody>
              <div className="flex flex-col space-y-8">
                {recyclingSteps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-4 text">
                    <span className="text-3xl text-green-500 font-bold">
                      {index + 1}.
                    </span>
                    <div>
                      <h2 className="text-slate-800">{step.title}</h2>
                      <p className="text-slate-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
const recyclingSteps = [
  {
    title: "Place your rubbish in the box",
    description:
      "Ensure the item is within the detection area for accurate scanning.",
  },
  {
    title: "Wait for the material to be detected",
    description:
      "The system will automatically recognize and classify the material.",
  },
  {
    title: "Dispose your item in the designated bin",
    description:
      "The correct bin will open based on the type of material detected.",
  },
  {
    title: "Scan the generated QR code",
    description: "Use the code to earn points and redeem rewards in the app.",
  },
];

export default DetectMaterialPage;
