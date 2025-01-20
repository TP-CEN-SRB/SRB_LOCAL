"use client";
import { socket } from "@/lib/socket";
import React, { useEffect, useRef } from "react";

const MaterialVideoStream = () => {
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    // Connect to the WebSocket server (your Node.js server).
    // Replace '192.168.45.215' with your server's IP or hostname.
    if (socket.connected) {
      console.log("WebSocket connection established.");
    }
    socket.on("connect", () => console.log("Web socket is connected"));
    socket.on("imgFrame", (base64String: string) => {
      // Convert base64 (ASCII) to a raw binary array
      const rawData = atob(base64String); // atob() decodes base64 ? ASCII
      const buffer = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; i++) {
        buffer[i] = rawData.charCodeAt(i);
      }

      // Turn raw binary into a Blob (MIME type: image/jpeg)
      const blob = new Blob([buffer], { type: "image/jpeg" });
      const imageURL = URL.createObjectURL(blob);

      // Update the <img> element to show the new frame
      if (imgRef.current) {
        imgRef.current.src = imageURL;
      }
    });
    socket.on("error", (error: Error) => {
      console.log("Error in websocket: ", error.message);
    });

    // Cleanup: close the socket if the component unmounts
    return () => {
      socket.close();
    };
  }, []);

  return (
    <div>
      <h1>Live JPEG Stream</h1>
      {/* We'll display the frames in an <img> */}
      <img
        className="border-black border"
        ref={imgRef}
        alt="Camera Stream"
        width="640"
        height="480"
      />
    </div>
  );
};

export default MaterialVideoStream;
