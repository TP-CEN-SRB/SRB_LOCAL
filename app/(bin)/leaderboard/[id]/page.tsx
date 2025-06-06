import { cookies } from "next/headers";
import { HOSTED_URL } from "@/keys";
import UsersLeaderboard from "@/components/Leaderboard/UsersLeaderboard";

const getLeaderboardData = async (token: string) => {
  const res = await fetch(`${HOSTED_URL}/api/leaderboard`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const { message } = await res.json();
    throw new Error(message || "Failed to fetch leaderboard data");
  }

  const { orderedDisposals } = await res.json();
  return orderedDisposals;
};

const LeaderboardPage = async ({ params }: { params: { id: string } }) => {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return <div className="text-red-500">No token found. Please log in.</div>;
  }

  const data = await getLeaderboardData(token);

  return (
    <UsersLeaderboard leaderBoardData={data} id={params.id} />
  );
};

export default LeaderboardPage;
