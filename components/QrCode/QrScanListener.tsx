"use client";

import { pusherClient } from "@/lib/pusher";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

type Props = {
  userId: string;
  queueId?: string; 
};

type DisposalUpdateEvent = {
  updated: boolean;
  queueId?: string; 
};

const QrScanListener = ({ userId, queueId }: Props) => {
  const router = useRouter();
  const sp = useSearchParams();
  const queueIdFromUrl = sp.get("queueId") ?? undefined;
  const activeQueueId = queueId ?? queueIdFromUrl;

  useEffect(() => {
    const userChannel = `disposal-qr-${userId}`;
    const queueChannel = activeQueueId ? `disposal-qr-${userId}-${activeQueueId}` : null;

    console.log("[QrScanListener] userId:", userId);
    console.log("[QrScanListener] queueId (prop/url):", activeQueueId);
    console.log("[QrScanListener] subscribing:", userChannel, queueChannel ?? "(no queue-specific)");

    // Always subscribe to user-level channel (backward compat)
    pusherClient.subscribe(userChannel);

    
    if (queueChannel) pusherClient.subscribe(queueChannel);

    const handler = (data: DisposalUpdateEvent) => {
      console.log("[QrScanListener] event payload:", data);

      // If backend sends queueId in the event, ensure it matches current queue
      if (activeQueueId && data.queueId && data.queueId !== activeQueueId) {
        console.log(
          "[QrScanListener] ignoring event for different queueId:",
          data.queueId
        );
        return;
      }

      if (data.updated === true) {
        console.log("[QrScanListener] disposal updated → redirecting to leaderboard");
        router.push(`/leaderboard/${userId}`);
      }
    };

    // Bind the same handler on both channels
    pusherClient.bind("disposal-update", handler);

    return () => {
      console.log("[QrScanListener] cleanup: unbind & unsubscribe");
      pusherClient.unbind("disposal-update", handler);
      pusherClient.unsubscribe(userChannel);
      if (queueChannel) pusherClient.unsubscribe(queueChannel);
    };
  }, [router, userId, activeQueueId]);

  return null;
};

export default QrScanListener;
