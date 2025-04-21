"use client"

import { useState, useEffect } from "react"
import { Medal, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { getMostActiveUsers, LeaderboardEntry } from "@/lib/db/leaderboard"

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter" | "year">("week")

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setLoading(true)
        const data = await getMostActiveUsers(timeRange)
        setLeaderboard(data)
      } catch (error) {
        console.error("Error fetching leaderboard data:", error)
        toast.error("Failed to load leaderboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboardData()
  }, [timeRange])

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case "week":
        return "This Week"
      case "month":
        return "This Month"
      case "quarter":
        return "This Quarter"
      case "year":
        return "This Year"
    }
  }

  // Calculate total tournaments by summing up all entries' tournament counts
  const totalTournaments = leaderboard.reduce((acc, entry) => {
    // We need to be careful not to double-count tournaments
    // For a more accurate count, tournaments should be tracked separately
    return acc + entry.tournaments
  }, 0) / 2; // Rough estimation to avoid double-counting

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground">See who's playing the most ping pong.</p>
      </div>

      <Tabs defaultValue="week" onValueChange={(value) => setTimeRange(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="quarter">Quarter</TabsTrigger>
          <TabsTrigger value="year">Year</TabsTrigger>
        </TabsList>
        
        <TabsContent value={timeRange}>
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Medal className="mr-2 h-5 w-5 text-primary" />
                    Top Players
                  </CardTitle>
                  <CardDescription>Most active players {getTimeRangeLabel().toLowerCase()}</CardDescription>
                </CardHeader>
                <CardContent>
                  {leaderboard.length === 0 ? (
                    <p className="text-muted-foreground">No activity recorded for this period.</p>
                  ) : (
                    <div className="space-y-4">
                      {leaderboard.slice(0, 10).map((entry, index) => (
                        <div key={entry.username} className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-8">
                              {index < 3 ? (
                                <span
                                  className={`text-lg font-bold ${
                                    index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-400" : "text-amber-700"
                                  }`}
                                >
                                  #{index + 1}
                                </span>
                              ) : (
                                <span className="text-sm text-muted-foreground">#{index + 1}</span>
                              )}
                            </div>
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>{entry.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{entry.username}</p>
                              <p className="text-sm text-muted-foreground">{Math.round(entry.playTime)} minutes played</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{entry.bookings} bookings</p>
                            <p className="text-sm text-muted-foreground">{entry.tournaments} tournaments</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                    Stats
                  </CardTitle>
                  <CardDescription>Activity summary {getTimeRangeLabel().toLowerCase()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Play Time</h3>
                      <p className="text-2xl font-bold">
                        {Math.round(leaderboard.reduce((sum, entry) => sum + entry.playTime, 0))} minutes
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Bookings</h3>
                      <p className="text-2xl font-bold">{leaderboard.reduce((sum, entry) => sum + entry.bookings, 0)}</p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Active Players</h3>
                      <p className="text-2xl font-bold">{leaderboard.length}</p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Tournaments</h3>
                      <p className="text-2xl font-bold">{Math.ceil(totalTournaments / leaderboard.length)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}