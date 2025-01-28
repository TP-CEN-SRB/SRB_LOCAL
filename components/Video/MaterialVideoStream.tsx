"use client";
import React, { useEffect, useState } from "react";
import { FadeLoader } from "react-spinners";

const MaterialVideoStream = () => {
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

      setImageURL(imageURL);
      setIsLoading(false);
    };

    ws.onerror = (error: Event) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      ws.close();
    };
  }, []);

  return isLoading ? (
    <div className="flex w-full h-full justify-center items-center">
      <FadeLoader color="#22c55e" />
    </div>
  ) : (
    <img
      className="w-full h-full"
      src={imageURL as string}
      alt="Camera Stream"
    />
  );
};

export default MaterialVideoStream;
