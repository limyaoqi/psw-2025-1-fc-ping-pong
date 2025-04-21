import { Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tournament } from "@/lib/db/tournament";

interface TournamentAlertProps {
  tournaments: Tournament[];
}

export default function TournamentAlert({ tournaments }: TournamentAlertProps) {
  if (tournaments.length === 0) return null;

  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertTitle>Tournament Day</AlertTitle>
      <AlertDescription>
        There{" "}
        {tournaments.length === 1
          ? "is a tournament"
          : "are tournaments"}{" "}
        scheduled for this day. Some time slots may be reserved.
      </AlertDescription>
    </Alert>
  );
}