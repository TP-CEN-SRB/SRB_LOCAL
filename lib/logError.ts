// utils/logError.ts
import { HOSTED_URL, API_KEY } from "@/keys";

export const logError = async (tag: string, message: string) => {
  try {
    const res = await fetch(`${HOSTED_URL}/api/crashlog`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({ message: `[${tag}] ${message}` }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("❌ Crash log failed:", result);
    } else {
      console.log("✅ Crash log sent:", result);
    }
  } catch (err) {
    console.error("🚨 Crash log error:", err);
  }
};
