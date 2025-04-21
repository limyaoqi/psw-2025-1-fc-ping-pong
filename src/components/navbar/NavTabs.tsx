import { Button } from "../ui/button";
import { Calendar, Trophy, Users } from "lucide-react";
import { cn } from "../../lib/utils";

interface NavTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function NavTabs({ activeTab, setActiveTab }: NavTabsProps) {
  return (
    <>
      <Button
        variant="ghost"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary w-[180px]",
          activeTab === "bookings" ? "text-primary" : "text-muted-foreground"
        )}
        onClick={() => setActiveTab("bookings")}
      >
        <Calendar className="mr-2 h-4 w-4" />
        Bookings
      </Button>
      <Button
        variant="ghost"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary w-[180px]",
          activeTab === "tournaments" ? "text-primary" : "text-muted-foreground"
        )}
        onClick={() => setActiveTab("tournaments")}
      >
        <Trophy className="mr-2 h-4 w-4" />
        Tournaments
      </Button>
      <Button
        variant="ghost"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary w-[180px]",
          activeTab === "leaderboard" ? "text-primary" : "text-muted-foreground"
        )}
        onClick={() => setActiveTab("leaderboard")}
      >
        <Users className="mr-2 h-4 w-4" />
        Leaderboard
      </Button>
    </>
  );
}
