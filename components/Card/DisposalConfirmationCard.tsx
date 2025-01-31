"use client";
import TimerRedirect from "@/components/TimerRedirect";
import React, { useEffect } from "react";
import useSound from "use-sound";

const DisposalConfirmationCard = ({ id }: { id: string }) => {
  const [play, { sound, stop }] = useSound("/thankyou.mp3");
  useEffect(() => {
    play();
    return () => stop();
  }, [sound, play, stop]);
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-slate-800">Thank You!</h1>
      <h2 className="text-lg text-slate-600">
        Your disposal has been recorded
      </h2>
      <TimerRedirect redirectTo={`/idle-video/${id}`} delayInMs={10000} />
    </div>
  );
};

export default DisposalConfirmationCard;
