"use client";

import React from "react";
import { cn } from "@/lib/utils";

type LeaderboardUser = {
  username: string;
  userId: string;
  balance: number;
  disposalCount: number;
  mostFrequentMaterial?: string;
};

const medalEmoji = ["🥇", "🥈", "🥉"];

const UsersLeaderboard = ({
  leaderBoardData,
}: {
  leaderBoardData: LeaderboardUser[];
}) => {
  return (
    <div className="min-h-screen bg-[#EFF8D0] py-12 px-2 flex justify-center">
      <div className="w-full max-w-6xl">
        <h1 className="text-4xl font-bold text-[#2B3A1E] py-6 text-center flex items-center justify-center gap-4">
          🏆 Leaderboard 🏆
        </h1>

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
            {leaderBoardData.slice(0, 10).map((user, index) => (
              <tr
                key={user.userId}
                className={`text-center font-medium transition-all ${
                  index % 2 === 0 ? "bg-[#F5FAE5]" : "bg-[#eaf4d1]"
                }`}
              >
                {/* 🥇 Medal Rank */}
                <td className="py-4">
                  {index < 3 ? (
                    <span
                      className={cn(
                        "inline-block animate-bounce",
                        index === 0 && "text-yellow-500",
                        index === 1 && "text-gray-500",
                        index === 2 && "text-orange-500"
                      )}
                    >
                      {medalEmoji[index]}
                    </span>
                  ) : (
                    String(index + 1).padStart(2, "0")
                  )}
                </td>

                {/* 👤 Avatar + Name */}
                <td className="py-4 flex items-center gap-3 text-left pl-6">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#9DC183] rounded-full shrink-0" />
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
