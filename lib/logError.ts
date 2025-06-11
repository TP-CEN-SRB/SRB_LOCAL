// utils/logError.ts

export const logError = async (tag: string, message: string) => {
  try {
    await fetch("/api/crashlog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: `[${tag}] ${message}` }),
    });
  } catch (err) {
    console.error("Failed to log crash error:", err);
  }
};
