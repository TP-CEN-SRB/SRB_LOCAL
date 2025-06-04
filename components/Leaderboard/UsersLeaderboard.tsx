"use client";

import React from "react";

type LeaderboardUser = {
  username: string;
  userId: string;
  balance: number;
  disposalCount: number;
  redemptionCount: number;
  mostFrequentMaterial?: string;
};

const UsersLeaderboard = ({
  leaderBoardData,
}: {
  leaderBoardData: LeaderboardUser[];
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 to-blue-900 flex flex-col items-center py-12 px-4">
      <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-4">
        🏅 Leaderboard 🏅
      </h1>

      <div className="w-full max-w-5xl rounded-lg overflow-hidden">
        <table className="w-full text-white border-separate border-spacing-y-3">
          <thead className="bg-blue-700">
            <tr className="text-center text-sm sm:text-base">
              <th className="py-3">Rank</th>
              <th className="py-3">Username</th>
              <th className="py-3">Points</th>
              <th className="py-3">Disposals</th>
              <th className="py-3">Redemptions</th>
              <th className="py-3">Top Material</th>
            </tr>
          </thead>
          <tbody>
            {leaderBoardData.map((user, index) => (
              <tr
                key={user.userId}
                className={`text-center text-sm sm:text-base font-medium ${
                  index % 2 === 0 ? "bg-blue-600" : "bg-blue-500"
                } rounded-lg`}
              >
                <td className="py-4">{String(index + 1).padStart(2, "0")}</td>
                <td className="py-4">{user.username}</td>
                <td className="py-4">{user.balance}</td>
                <td className="py-4">{user.disposalCount}</td>
                <td className="py-4">{user.redemptionCount}</td>
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
