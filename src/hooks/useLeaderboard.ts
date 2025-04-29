import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getMostActiveUsers, LeaderboardEntry } from "@/lib/db/leaderboard";

type TimeRange = "week" | "month" | "quarter" | "year";

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("week");

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setLoading(true);
        const data = await getMostActiveUsers(timeRange);
        console.log("Fetched leaderboard data:", data);
        setLeaderboard(data);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        toast.error("Failed to load leaderboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [timeRange]);

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "quarter":
        return "This Quarter";
      case "year":
        return "This Year";
    }
  };

  // Calculate total tournaments by summing up all entries' tournament counts
  const totalTournaments =
    leaderboard.length > 0
      ? Math.ceil(
          leaderboard.reduce((acc, entry) => acc + entry.tournaments, 0) / 2
        )
      : 0;

  return {
    leaderboard,
    loading,
    timeRange,
    setTimeRange,
    getTimeRangeLabel,
    totalTournaments,
  };
}