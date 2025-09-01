"use client";

import IdleVideo from "./IdleVideo";
import React, { useState, useEffect, useCallback } from "react";
import { pusherClient } from "@/lib/pusher";
import { useRouter } from "next/navigation";

export type BinCapacity = {
  material: string;
  percentage: number;
};

export default function IdleVideoClient({
  initialCapacities,
  id,
}: {
  initialCapacities: BinCapacity[];
  id: string;
}) {
  const [capacities, setCapacities] = useState(initialCapacities);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ✅ Fix: useCallback to memorize the function
  const fetchCapacities = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/bin-capacity/${id}`, {
        credentials: "include",
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("[IdleVideo] fetch failed:", errorText);
        return;
      }

      const data = await res.json();
      setCapacities(data);
    } catch (err) {
      console.error("[IdleVideo] error fetching capacities:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ✅ Fix: include fetchCapacities in deps
  useEffect(() => {
    fetchCapacities();
  }, [fetchCapacities]);

  const getColorForPercentage = (percentage: number) => {
    if (percentage >= 100) return "#ef4444"; // red
    if (percentage >= 80) return "#f97316";  // orange
    if (percentage >= 50) return "#facc15";  // yellow
    return "#22c55e";                        // green
  };

  useEffect(() => {
    const channel = `start-detect-${id}`;
    pusherClient.subscribe(channel);

    pusherClient.bind("start-update", (data: { start: boolean }) => {
      if (data.start === true) {
        router.push(`/detect-material/${id}`);
      }
    });

    return () => {
      pusherClient.unbind("start-update");
      pusherClient.unsubscribe(channel);
    };
  }, [id, router]);

  return (
    <div className="relative w-full h-screen bg-gray-100">
      <IdleVideo />
      <div className="absolute top-4 right-0 z-10 text-white px-4 py-3 space-y-2 text-sm w-[420px] rounded-md bg-gray-800/80">
        <div className="flex justify-between gap-3">
          {capacities.length === 0 ? (
            <div>{loading ? "Loading..." : "No data available"}</div>
          ) : (
            capacities.map((bin, idx) => {
              const fillColor = getColorForPercentage(bin.percentage);

              return (
                <div key={idx} className="flex flex-col items-center text-xs">
                  <svg
                    viewBox="0 0 448 512"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-14 h-14"
                  >
                    <defs>
                      <linearGradient id={`fill-${idx}`} x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor={fillColor} />
                        <stop offset={`${bin.percentage}%`} stopColor={fillColor} />
                        <stop offset={`${bin.percentage}%`} stopColor="white" />
                        <stop offset="100%" stopColor="white" />
                      </linearGradient>
                    </defs>
                    <path
                      fill={`url(#fill-${idx})`}
                      d="M135.2 17.7C140.1 7.4 150.6 0 162.5 0H285.5c11.9 0 22.4 7.4 27.3 17.7L328 32H432c8.8 0 16 7.2 16 16s-7.2 16-16 16H416l-21.2 372.9c-1.8 31.7-28.1 57.1-59.9 57.1H113.1c-31.8 0-58.1-25.4-59.9-57.1L32 64H16C7.2 64 0 56.8 0 48s7.2-16 16-16H120l15.2-14.3zM144 96c-8.8 0-16 7.2-16 16V400c0 8.8 7.2 16 16 16s16-7.2 16-16V112c0-8.8-7.2-16-16-16zm80 0c-8.8 0-16 7.2-16 16V400c0 8.8 7.2 16 16 16s16-7.2 16-16V112c0-8.8-7.2-16-16-16zm80 0c-8.8 0-16 7.2-16 16V400c0 8.8 7.2 16 16 16s16-7.2 16-16V112c0-8.8-7.2-16-16-16z"
                    />
                  </svg>
                  <div className="mt-1 font-bold text-white drop-shadow text-[13px] text-center">
                    {bin.material.toUpperCase()}
                  </div>
                  <div className="text-yellow-400 drop-shadow font-semibold">
                    {bin.percentage >= 100 ? "FULL" : `${bin.percentage}%`}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
