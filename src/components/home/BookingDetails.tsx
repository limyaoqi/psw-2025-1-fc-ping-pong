"use client";

import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Clock } from "lucide-react";
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

interface BookingDetailsProps {
  date: Date;
  selectedTimeSlot: string | null;
  duration: "30" | "60";
  setDuration: (duration: "30" | "60") => void;
  currentUser: any | null;
  handleBooking: () => Promise<void>;
}

export function BookingDetails({
  date,
  selectedTimeSlot,
  duration,
  setDuration,
  currentUser,
  handleBooking,
}: BookingDetailsProps) {
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
          <div id="time" className="p-2 border rounded-md flex items-center">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            {selectedTimeSlot ? (
              format(
                new Date().setHours(
                  Number.parseInt(selectedTimeSlot.split(":")[0]),
                  Number.parseInt(selectedTimeSlot.split(":")[1]),
                  0,
                  0
                ),
                "h:mm a"
              )
            ) : (
              "Select a time slot"
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <Select
            value={duration}
            onValueChange={(value) => setDuration(value as "30" | "60")}
          >
            <SelectTrigger id="duration" className="w-full">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent className="bg-black text-white">
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 p-3 border border-dashed rounded-md border-primary/30 bg-primary/5">
          <h4 className="text-sm font-medium flex items-center">
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Booking Policies
          </h4>
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