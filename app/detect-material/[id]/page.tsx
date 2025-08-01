"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FadeLoader, RingLoader, BeatLoader } from "react-spinners";

import Card from "@/components/Card/Card";
import CardHeader from "@/components/Card/CardHeader";
import CardBody from "@/components/Card/CardBody";
import TimerRedirect from "@/components/TimerRedirect";
import MaterialVideoStream from "@/components/Video/MaterialVideoStream";

import { createDisposal } from "@/app/action/disposal";
import { getBinByUserIdAndMaterial } from "@/app/action/bin";
import { logError } from "@/lib/logError";
import { pusherClient } from "@/lib/pusher";


type DetectionData = {
  material: string;
  weightInGrams?: number;
  thrown?: boolean;
};

const DetectMaterialPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();

  const [detecting, setDetecting] = useState(true);
  const [material, setMaterial] = useState("");
  const [weightInGrams, setWeightInGrams] = useState<number>();
  const [resetCondition, setResetCondition] = useState(false);
  const [error, setError] = useState<string>();
  const [thrown, setThrown] = useState(false);

  const [isMultiMode, setIsMultiMode] = useState(false);
  const [multiDisposalIds, setMultiDisposalIds] = useState<string[]>([]);
  const [multiDetectionQueue, setMultiDetectionQueue] = useState<
    { material: string; weightInGrams: number }[]
  >([]);
  const isProcessing = useRef(false);

  const validateBinStatus = useCallback(async (mat: string) => {
    const bin = await getBinByUserIdAndMaterial(params.id, mat);
    if (!bin || "error" in bin) {
      setError(bin?.error || "Invalid bin");
      return false;
    }
    if (bin.currentCapacity === 100) {
      setError(`${bin.binMaterial.name} bin is already full!`);
      return false;
    }
    if (bin.status === "UNDER_MAINTENANCE") {
      setError(`${bin.binMaterial.name} bin is under maintenance!`);
      return false;
    }
    return true;
  }, [params.id]);

  const handleNextDisposal = useCallback(async () => {
    if (isProcessing.current || multiDetectionQueue.length === 0) return;

    isProcessing.current = true;

    const { material, weightInGrams } = multiDetectionQueue[0];
    const valid = await validateBinStatus(material);
    if (!valid) {
      isProcessing.current = false;
      return;
    }

    const { disposalId, error } = await createDisposal({ material, weightInGrams }, params.id);
    if (error || !disposalId) {
      setError(error || "Disposal failed!");
      await logError("DISPOSAL_FAIL", `Material: ${material}, UserId: ${params.id}, Error: ${error}`);
      isProcessing.current = false;
      return;
    }

    setMultiDisposalIds((prev) => {
      const updated = [...prev, disposalId];
      if (updated.length === multiDetectionQueue.length) {
        router.push(`/disposal-qr/${params.id}?multi=true&ids=${updated.join(",")}`);
      }
      return updated;
    });

    setMultiDetectionQueue((prev) => prev.slice(1));
    isProcessing.current = false;
  }, [multiDetectionQueue, params.id, router, validateBinStatus]);

  useEffect(() => {
    if (isMultiMode && multiDetectionQueue.length > 0) {
      handleNextDisposal();
    }
  }, [multiDetectionQueue, isMultiMode, handleNextDisposal]);

  useEffect(() => {
    pusherClient.subscribe(`detect-material-${params.id}`);

    pusherClient.bind("material-details", async (data: DetectionData | DetectionData[]) => {
      if (Array.isArray(data)) {
        setIsMultiMode(true);
        const cleanQueue = data
          .filter((d) => d.thrown && d.material && typeof d.weightInGrams === "number")
          .map((d) => ({
            material: d.material.toUpperCase(),
            weightInGrams: d.weightInGrams!,
          }));
        setMultiDetectionQueue(cleanQueue);
        return;
      }

      const mat = data.material?.toUpperCase();
      if (!mat) return;

      if (!data.thrown && data.weightInGrams === undefined) {
        setMaterial(mat);
        setDetecting(false);
        setResetCondition(true);
        setThrown(false);
        return;
      }

      if (data.thrown && typeof data.weightInGrams === "number") {
        setMaterial(mat);
        setWeightInGrams(data.weightInGrams);
        setThrown(true);

        const valid = await validateBinStatus(mat);
        if (!valid) return;

        const { disposalId, point, error } = await createDisposal(
          { material: mat, weightInGrams: data.weightInGrams },
          params.id
        );

        if (error || !disposalId) {
          setError(error || "Disposal failed!");
        } else if (typeof point === "number" && point > 0) {
          router.push(`/disposal-qr/${params.id}?disposalId=${disposalId}`);
        } else {
          router.push(`/disposal-confirmation/${params.id}`);
        }
      }
    });

    return () => {
      pusherClient.unbind("material-details");
      pusherClient.unsubscribe(`detect-material-${params.id}`);
    };
  }, [params.id, router, validateBinStatus]);

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
                  <h2 className="text-3xl font-bold text-green-500">{material} Detected</h2>
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
              </div>
            )}

            {isMultiMode && multiDisposalIds.length > 0 && (
              <p className="text-sm text-center text-slate-500 mt-2">
                {multiDisposalIds.length}/{multiDetectionQueue.length + multiDisposalIds.length} items processed
              </p>
            )}

            {error && (
              <TimerRedirect delayInMs={3000} redirectTo={`/idle-video/${params.id}`} />
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
                    <span className="text-3xl text-green-500 font-bold">{index + 1}.</span>
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
    title: "Place your rubbish in the center of the camera region",
    description:
      "Ensure the item is within the detection area for accurate scanning.",
  },
  {
    title: "Wait for the material to be detected",
    description:
      "You may need to tilt the item if the system fails to recognize the material.",
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
