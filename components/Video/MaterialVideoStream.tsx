"use client";
import { socket } from "@/lib/socket";
import React, { useEffect, useRef } from "react";

const MaterialVideoStream = () => {
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    // Connect to the WebSocket server (assuming it's on localhost:8080)
    const ws = new WebSocket("ws://192.168.5.215:8080"); // Change if needed
    ws.onopen = () => {
      console.log("WebSocket connection established.");
    };

    ws.onmessage = (event: MessageEvent) => {
      const base64String = event.data as string; // Base64-encoded image

      // Convert base64 to raw binary data
      const rawData = atob(base64String);
      const buffer = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; i++) {
        buffer[i] = rawData.charCodeAt(i);
      }

      // Create a Blob (image/jpeg)
      const blob = new Blob([buffer], { type: "image/jpeg" });
      const imageURL = URL.createObjectURL(blob);

      if (imgRef.current) {
        imgRef.current.src = imageURL; // Update image src
      }
    };

    ws.onerror = (error: Event) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      ws.close(); // Cleanup WebSocket connection on unmount
    };
  }, []);

  return (
    <div className="flex-1">
      <img
        className="border-black border w-full h-full"
        ref={imgRef}
        alt="Camera Stream"
      />
    </div>
  );
};

export default MaterialVideoStream;
