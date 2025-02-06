"use client";
import React, { useEffect, useState } from "react";
import { FadeLoader } from "react-spinners";

const MaterialVideoStream = () => {
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const ws = new WebSocket("ws://192.168.54.214:8000"); // Change if needed
    ws.onopen = () => {
      console.log("WebSocket connection established.");
    };

    ws.onmessage = (event: MessageEvent) => {
      const blob = event.data as Blob; // This is a Blob object

      // Create a FileReader to convert Blob to Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string; // This is the Base64 string
        const formattedBase64String = base64String.replace(
          "data:application/octet-stream;base64,",
          ""
        );
        const rawData = atob(formattedBase64String);
        // const buffer = new Uint8Array(rawData.length);
        // console.log(rawData.toString());
        // for (let i = 0; i < rawData.length; i++) {
        //   buffer[i] = rawData.charCodeAt(i);
        // }
        //console.log(buffer);

        // Create a Blob (image/jpeg)
        // const blob = new Blob([buffer], { type: "image/jpeg" });
        // const imageURL = URL.createObjectURL(blob);
        // Set the base64 string as the image URL (you can use this directly)
        //console.log(imageURL);
        setImageURL("data:image/jpeg;base64," + rawData.toString());
        setIsLoading(false);
      };

      // Read the Blob as a data URL (which includes base64 string)
      reader.readAsDataURL(blob);
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
