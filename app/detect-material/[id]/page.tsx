"use client";
import { useState, useEffect, useRef } from "react";
import { FadeLoader, RingLoader, BeatLoader } from "react-spinners";
import Card from "@/components/Card/Card";
import CardHeader from "@/components/Card/CardHeader";
import CardBody from "@/components/Card/CardBody";
import { useRouter } from "next/navigation";
import { createDisposal, closeQueue } from "@/app/action/disposal";
import TimerRedirect from "@/components/TimerRedirect";
import { pusherClient } from "@/lib/pusher";
import { getBinByUserIdAndMaterial } from "@/app/action/bin";
import MaterialVideoStream from "@/components/Video/MaterialVideoStream";
import { logError } from "@/lib/logError";

const DetectMaterialPage = ({ params }: { params: { id: string } }) => {
  const [detecting, setDetecting] = useState(true);
  const [material, setMaterial] = useState("");
  const [weightInGrams, setWeightInGrams] = useState<number>();
  const [resetCondition, setResetCondition] = useState(false);
  const [error, setError] = useState<string>();
  const [thrown, setThrown] = useState(false);
  const [queueId, setQueueId] = useState<string>();
  const [disposals, setDisposals] = useState<
    { material: string; weightInGrams?: number; thrown: boolean }[]
  >([]);
  const [completed, setCompleted] = useState(0);
  const [finished, setFinished] = useState(false); // ✅ freeze flag

  const router = useRouter();
  const processed = useRef<Set<string>>(new Set());

  // --- Bin checks
  useEffect(() => {
    if (finished) return; // 🚫 no more bin checks

    const checkIfBinIsInOrder = async () => {
      if (material) {
        console.log("🔎 Checking bin for material:", material);
        const bin = await getBinByUserIdAndMaterial(params.id, material);
        console.log("📦 Bin lookup result:", bin);

        if (!bin || "error" in bin) {
          setDetecting(false);
          setError(bin?.error ?? "Bin not found");
          await logError(
            "BIN_LOOKUP_FAIL",
            `Material: ${material}, UserId: ${params.id}, Error: ${bin?.error}`
          );
          return;
        }
        if (bin.currentCapacity === 100) {
          setDetecting(false);
          setError(`${bin.binMaterial.name} bin is already full!`);
          await logError(
            "BIN_FULL",
            `Material: ${material}, UserId: ${params.id}`
          );
          return;
        }
        if (bin.status === "UNDER_MAINTENANCE") {
          setDetecting(false);
          setError(`${bin.binMaterial.name} bin is under maintenance!`);
          await logError(
            "BIN_MAINTENANCE",
            `Material: ${material}, UserId: ${params.id}`
          );
          return;
        }
      }
    };
    checkIfBinIsInOrder();
  }, [params.id, material, finished]);

  // --- Track disposals array
  useEffect(() => {
    if (finished) return;

    // 🚀 If all done, mark session finished right away
    if (completed > 0 && disposals.length > 0 && completed === disposals.length) {
      console.log("✅ All disposals completed → marking finished early");
      setFinished(true); // 🔑 freezes pipeline immediately
      return;
    }

    console.log("♻️ Disposals updated:", disposals);

    const nextUnthrown = disposals.find((d) => !d.thrown);
    if (nextUnthrown) {
      console.log("➡️ Next unthrown disposal:", nextUnthrown);
      setMaterial(nextUnthrown.material.toUpperCase());
      setWeightInGrams(nextUnthrown.weightInGrams ?? undefined);
      setThrown(false);
      setDetecting(false);
      setResetCondition(true);
    }
  }, [disposals, completed, finished]);

  // --- Close queue and redirect once all disposals are processed
  useEffect(() => {
    const finishSession = async () => {
      if (
        !finished &&
        completed > 0 &&
        disposals.length > 0 &&
        completed === disposals.length &&
        queueId
      ) {
        console.log("🔒 Closing queue before redirect:", queueId);

        // 🚀 freeze pipeline immediately
        setFinished(true);

        const result = await closeQueue(queueId);
        if (result?.error) {
          console.error("⚠️ Failed to close queue:", result.error);
        } else {
          console.log("✅ Queue closed successfully:", queueId);
        }

        router.push(`/disposal-qr/${params.id}?queueId=${queueId}`);
      }
    };

    finishSession();
  }, [completed, disposals, queueId, params.id, router, finished]);

  // --- Mark as thrown when weight is set
  useEffect(() => {
    if (finished) return; // 🚫 no more marking
    if (weightInGrams && !thrown) {
      console.log("📏 Weight detected, marking as thrown:", weightInGrams);
      setThrown(true);
    }
  }, [weightInGrams, thrown, finished]);

  // --- Disposal creation
  useEffect(() => {
    if (finished) return; // 🚫 freeze disposal creation
    if (completed >= disposals.length && disposals.length > 0) return;

    const handleDisposal = async () => {
      console.log("⚡ handleDisposal triggered:", {
        thrown,
        material,
        weightInGrams,
        queueId,
      });

      if (!thrown || !material || !weightInGrams || !queueId) {
        console.log("⏸️ Skipping incomplete disposal");
        return;
      }

      const key = `${queueId}-${material.toUpperCase()}-${weightInGrams}`;
      if (processed.current.has(key)) {
        console.log("⏭️ Duplicate disposal skipped:", key);
        return;
      }
      processed.current.add(key);

      console.log("🗑️ Processing disposal:", {
        material,
        weightInGrams,
        queueId,
      });
      const { point, error } = await createDisposal(
        { material, weightInGrams },
        params.id,
        queueId
      );

      if (error) {
        console.error("❌ Disposal error:", error);
        setError(error);
        await logError(
          "DISPOSAL_FAIL",
          `Material: ${material}, Weight: ${weightInGrams}, UserId: ${params.id}, Error: ${error}`
        );
      } else {
        console.log("✅ Disposal succeeded, points awarded:", point);
        setCompleted((prev) => prev + 1); // simplified ✅
        setDisposals((prev) => {
          const updated = [...prev];
          const idx = updated.findIndex(
            (d) =>
              d.material.toUpperCase() === material.toUpperCase() && !d.thrown
          );
          if (idx !== -1) {
            updated[idx] = { ...updated[idx], thrown: true, weightInGrams };
          }
          return updated;
        });
      }

      setThrown(false);
      setWeightInGrams(undefined);
    };

    handleDisposal();
  }, [
    thrown,
    material,
    weightInGrams,
    queueId,
    params.id,
    completed,
    disposals.length,
    finished,
  ]);

  // --- Pusher subscription
  useEffect(() => {
    if (finished) return; // 🚫 no subscription after finished
    console.log("📡 Subscribing to channel:", `detect-material-${params.id}`);
    pusherClient.subscribe(`detect-material-${params.id}`);

    pusherClient.bind(
      "material-details",
      (data: {
        queueId: string;
        disposals: {
          material: string;
          weightInGrams?: number;
          thrown: boolean;
        }[];
      }) => {
        console.log("📩 Received from Pusher:", data);

        if (data.queueId !== queueId) {
          console.log("🔄 New queue detected:", data.queueId);
          processed.current.clear();
          setCompleted(0);
          setDisposals([]);
          setQueueId(data.queueId);
        }

        setDisposals((prev) => {
          const merged = [...prev];
          for (const d of data.disposals) {
            const idx = merged.findIndex(
              (x) => x.material.toUpperCase() === d.material.toUpperCase()
            );
            if (idx >= 0) {
              merged[idx] = {
                ...merged[idx],
                weightInGrams: d.weightInGrams ?? merged[idx].weightInGrams,
              };
            } else {
              merged.push({
                material: d.material,
                weightInGrams: d.weightInGrams,
                thrown: false,
              });
            }
          }
          return merged;
        });
      }
    );

    return () => {
      console.log("❌ Unsubscribing from channel:", `detect-material-${params.id}`);
      pusherClient.unbind("material-details");
      pusherClient.unsubscribe(`detect-material-${params.id}`);
    };
  }, [params.id, queueId, finished]);

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
              {detecting && !finished && <FadeLoader color="#22c55e" />}
            </div>
            <CardBody>
              {finished ? (
                <div className="text-center space-y-6">
                  <h2 className="text-3xl font-bold text-green-500">Loading QR...</h2>
                  <p className="text-slate-600">Please wait while we generate your code.</p>
                </div>
              ) : detecting ? (
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
            {!detecting && !error && !finished && (
              <div className="flex flex-col items-center justify-center mt-4">
                <BeatLoader color="#22c55e" />
                {thrown && weightInGrams && (
                  <p className="text-slate-600">Processing your disposal...</p>
                )}
              </div>
            )}
            {error && (
              <TimerRedirect
                delayInMs={3000}
                redirectTo={`/idle-video/${params.id}`}
              />
            )}
            {!error && !thrown && weightInGrams === undefined && !finished && (
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
