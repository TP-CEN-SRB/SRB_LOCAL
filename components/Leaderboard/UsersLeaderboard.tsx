"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

type LeaderboardUser = {
  username: string;
  userId: string;
  balance: number;
  disposalCount: number;
  mostFrequentMaterial?: string;
};

const medalEmoji = ["🥇", "🥈", "🥉"];
const rankNumberEmojis = ["4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

const UsersLeaderboard = ({
  leaderBoardData,
}: {
  leaderBoardData: LeaderboardUser[];
}) => {
  const topThree = leaderBoardData.slice(0, 3);
  const nextSeven = leaderBoardData.slice(3, 10);

  const [animatedIndex, setAnimatedIndex] = useState<number | null>(null);
  const prevTopRef = useRef<LeaderboardUser[]>([]);

  // 🎯 Trigger confetti manually
  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.3 },
    });
  };

  useEffect(() => {
    const prevTop = prevTopRef.current;
    const currentTop = leaderBoardData.slice(0, 3);

    // 🥇 Only trigger if a new user takes 1st place
    if (prevTop[0]?.userId !== currentTop[0]?.userId) {
      setAnimatedIndex(0);
      triggerConfetti();
      setTimeout(() => setAnimatedIndex(null), 1000);
    }

    prevTopRef.current = currentTop;
  }, [leaderBoardData]);

  return (
    <div className="min-h-screen bg-[#EFF8D0] py-12 px-2 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <h1 className="text-4xl font-bold text-[#2B3A1E] py-6 text-center flex items-center justify-center gap-4">
          🏆 Leaderboard 🏆
        </h1>

        {/* 🎉 Celebrate button */}
        <button
          onClick={triggerConfetti}
          className="mb-6 bg-[#9DC183] hover:bg-[#84aa6c] text-white font-semibold py-2 px-6 rounded-xl shadow"
        >
          🎉 Celebrate!
        </button>

        {/* Top 3 Section */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          {/* 🥈 */}
          <div
            className={cn(
              "flex flex-col items-center bg-[#CCE0B4] rounded-2xl px-6 py-4 shadow-md text-center w-full sm:w-1/3 order-1 sm:order-1"
            )}
          >
            <div className="text-4xl animate-bounce text-gray-500 mb-2">🥈</div>
            <div className="text-lg font-semibold truncate">{topThree[1]?.username}</div>
            <div className="text-sm">Points: {topThree[1]?.balance}</div>
            <div className="text-sm">Disposals: {topThree[1]?.disposalCount}</div>
            <div className="text-sm">Favourite: {topThree[1]?.mostFrequentMaterial ?? "N/A"}</div>
          </div>

          {/* 🥇 */}
          <div
            className={cn(
              "flex flex-col items-center bg-[#CCE0B4] rounded-2xl px-6 py-4 shadow-md text-center w-full sm:w-1/3 order-0 sm:order-2",
              animatedIndex === 0 && "animate-pulse ring-4 ring-green-500"
            )}
          >
            <div className="text-4xl animate-bounce text-yellow-500 mb-2">🥇</div>
            <div className="text-lg font-semibold truncate">{topThree[0]?.username}</div>
            <div className="text-sm">Points: {topThree[0]?.balance}</div>
            <div className="text-sm">Disposals: {topThree[0]?.disposalCount}</div>
            <div className="text-sm">Favourite: {topThree[0]?.mostFrequentMaterial ?? "N/A"}</div>
          </div>

          {/* 🥉 */}
          <div
            className={cn(
              "flex flex-col items-center bg-[#CCE0B4] rounded-2xl px-6 py-4 shadow-md text-center w-full sm:w-1/3 order-2 sm:order-3"
            )}
          >
            <div className="text-4xl animate-bounce text-orange-500 mb-2">🥉</div>
            <div className="text-lg font-semibold truncate">{topThree[2]?.username}</div>
            <div className="text-sm">Points: {topThree[2]?.balance}</div>
            <div className="text-sm">Disposals: {topThree[2]?.disposalCount}</div>
            <div className="text-sm">Favourite: {topThree[2]?.mostFrequentMaterial ?? "N/A"}</div>
          </div>
        </div>

        {/* Table for 4th–10th */}
        <table className="w-full table-fixed text-[#2B3A1E]">
          <thead className="bg-[#CCE0B4] uppercase text-sm">
            <tr className="text-center">
              <th className="w-[10%] py-3">Rank</th>
              <th className="w-[30%] py-3 text-left pl-6">Name</th>
              <th className="w-[20%] py-3">Disposals</th>
              <th className="w-[20%] py-3">Points</th>
              <th className="w-[20%] py-3">Favourite</th>
            </tr>
          </thead>
          <tbody>
            {nextSeven.map((user, index) => (
              <tr
                key={user.userId}
                className={`text-center font-medium transition-all ${
                  index % 2 === 0 ? "bg-[#F5FAE5]" : "bg-[#eaf4d1]"
                }`}
              >
                <td className="py-4 text-lg">{rankNumberEmojis[index]}</td>
                <td className="py-4 text-left pl-6">
                  <span className="text-sm sm:text-base truncate">
                    {user.username}
                  </span>
                </td>
                <td className="py-4">{user.disposalCount}</td>
                <td className="py-4">{user.balance}</td>
                <td className="py-4">{user.mostFrequentMaterial ?? "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersLeaderboard;
