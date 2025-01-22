"use client";
import IdleVideo from "@/components/Video/IdleVideo";
import { pusherClient } from "@/lib/pusher";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const IdleVideoPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();

  useEffect(() => {
    pusherClient.subscribe(`start-detect-${params.id}`);
    pusherClient.bind("start-update", (data: { start: boolean }) => {
      if (data.start === true) {
        router.push(`/detect-material/${params.id}`);
      }
    });
    return () => {
      pusherClient.unbind("start-update");
      pusherClient.unsubscribe(`start-detect-${params.id}`);
    };
  }, [router, params.id]);

  return <IdleVideo />;
};

export default IdleVideoPage;
