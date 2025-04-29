"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { LeaderboardPlayersList } from "@/components/leaderboard/LeaderboardPlayersList";
import { LeaderboardStatsCard } from "@/components/leaderboard/LeaderboardStatsCard";
import { LoadingSpinner } from "@/components/leaderboard/LoadingSpinner";

export default function Leaderboard() {
  const {
    leaderboard,
    loading,
    timeRange,
    setTimeRange,
    getTimeRangeLabel,
    totalTournaments,
  } = useLeaderboard();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground">
          See who's playing the most ping pong.
        </p>
      </div>

      <Tabs
        defaultValue="week"
        onValueChange={(value) =>
          setTimeRange(value as "week" | "month" | "quarter" | "year")
        }
      >
        <TabsList className="grid w-full grid-cols-4 gap-2">
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="quarter">Quarter</TabsTrigger>
          <TabsTrigger value="year">Year</TabsTrigger>
        </TabsList>

        <TabsContent value={timeRange}>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <LeaderboardPlayersList
                leaderboard={leaderboard}
                timeRangeLabel={getTimeRangeLabel()}
              />
              <LeaderboardStatsCard
                leaderboard={leaderboard}
                timeRangeLabel={getTimeRangeLabel()}
                totalTournaments={totalTournaments}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}