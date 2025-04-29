import { TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LeaderboardEntry } from "@/lib/db/leaderboard";

interface LeaderboardStatsCardProps {
  leaderboard: LeaderboardEntry[];
  timeRangeLabel: string;
  totalTournaments: number;
}

export function LeaderboardStatsCard({
  leaderboard,
  timeRangeLabel,
  totalTournaments,
}: LeaderboardStatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-primary" />
          Stats
        </CardTitle>
        <CardDescription>
          Activity summary {timeRangeLabel.toLowerCase()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Total Play Time
            </h3>
            <p className="text-2xl font-bold">
              {Math.round(
                leaderboard.reduce((sum, entry) => sum + entry.playTime, 0)
              )}{" "}
              minutes
            </p>
          </div>
          <Separator />
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Total Bookings
            </h3>
            <p className="text-2xl font-bold">
              {leaderboard.reduce((sum, entry) => sum + entry.bookings, 0)}
            </p>
          </div>
          <Separator />
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Active Players
            </h3>
            <p className="text-2xl font-bold">{leaderboard.length}</p>
          </div>
          <Separator />
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Tournaments
            </h3>
            <p className="text-2xl font-bold">
              {leaderboard.length > 0
                ? Math.ceil(totalTournaments / leaderboard.length)
                : 0}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}