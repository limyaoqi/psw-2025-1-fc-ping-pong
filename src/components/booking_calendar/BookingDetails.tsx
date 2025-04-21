import { format } from "date-fns";
import { Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@/lib/db/user";

interface BookingFormProps {
  date: Date;
  selectedTimeSlot: string | null;
  duration: "30" | "60";
  setDuration: (duration: "30" | "60") => void;
  currentUser: User | null;
  handleBooking: () => void;
}

export default function BookingForm({
  date,
  selectedTimeSlot,
  duration,
  setDuration,
  currentUser,
  handleBooking,
}: BookingFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Details</CardTitle>
        <CardDescription>Configure your reservation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <div id="date" className="p-2 border rounded-md">
            {format(date, "EEEE, MMMM d, yyyy")}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Time Slot</Label>
          <div
            id="time"
            className="p-2 border rounded-md flex items-center"
          >
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            {selectedTimeSlot
              ? format(
                  new Date().setHours(
                    Number.parseInt(selectedTimeSlot.split(":")[0]),
                    Number.parseInt(selectedTimeSlot.split(":")[1]),
                    0,
                    0
                  ),
                  "h:mm a"
                )
              : "Select a time slot"}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <Select
            value={duration}
            onValueChange={(value) => setDuration(value as "30" | "60")}
          >
            <SelectTrigger id="duration">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Booking Policies</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Maximum 2 hours per day</li>
            <li>• Maximum 3 bookings per week</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={!selectedTimeSlot || !currentUser}
          onClick={handleBooking}
        >
          Book Table
        </Button>
      </CardFooter>
    </Card>
  );
}