"use client"

import { Medal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LeaderboardEntry } from "@/lib/db/leaderboard";

interface LeaderboardPlayersListProps {
  leaderboard: LeaderboardEntry[];
  timeRangeLabel: string;
}

export function LeaderboardPlayersList({
  leaderboard,
  timeRangeLabel,
}: LeaderboardPlayersListProps) {
  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Medal className="mr-2 h-5 w-5 text-primary" />
          Top Players
        </CardTitle>
        <CardDescription>
          Most active players {timeRangeLabel.toLowerCase()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <p className="text-muted-foreground">
            No activity recorded for this period.
          </p>
        ) : (
          <div className="space-y-4">
            {leaderboard.slice(0, 10).map((entry, index) => (
              <div
                key={entry.username}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8">
                    {index < 3 ? (
                      <span
                        className={`text-lg font-bold ${
                          index === 0
                            ? "text-yellow-500"
                            : index === 1
                            ? "text-gray-400"
                            : "text-amber-700"
                        }`}
                      >
                        #{index + 1}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        #{index + 1}
                      </span>
                    )}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {entry.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{entry.username}</p>
                    <p className="text-sm text-muted-foreground">
                      {Math.round(entry.playTime)} minutes played
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{entry.bookings} bookings</p>
                  <p className="text-sm text-muted-foreground">
                    {entry.tournaments} tournaments
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}