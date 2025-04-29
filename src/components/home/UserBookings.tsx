"use client";

import { format } from "date-fns";
import { Trophy } from "lucide-react";
import { User } from "@/lib/db/user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Booking } from "@/lib/db/booking";
import { toast } from "sonner";

interface UserBookingsProps {
  currentUser: User | null;
  userBookings: Booking[];
}

export function UserBookings({
  currentUser,
  userBookings,
}: UserBookingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
          Your Bookings
        </CardTitle>
        <CardDescription>View your upcoming reservations</CardDescription>
      </CardHeader>
      <CardContent>
        {!currentUser ? (
          <div className="text-muted-foreground flex items-center p-4 border border-dashed rounded-md">
            <Trophy className="mr-2 h-5 w-5 text-muted-foreground/50" />
            <p>Please log in to see your bookings.</p>
          </div>
        ) : userBookings.length === 0 ? (
          <div className="text-muted-foreground flex items-center p-4 border border-dashed rounded-md">
            <Trophy className="mr-2 h-5 w-5 text-muted-foreground/50" />
            <p>You don't have any bookings yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userBookings
              .sort((a, b) => {
                const dateA = new Date(a.date + "T" + a.startTime);
                const dateB = new Date(b.date + "T" + b.startTime);
                return dateA.getTime() - dateB.getTime();
              })
              .map((booking) => (
                <div
                  key={booking.id}
                  className="flex justify-between items-center p-3 border rounded-md hover:bg-accent/20 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">
                        {format(new Date(booking.date), "EEEE, MMMM d")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.startTime} - {booking.endTime} ({booking.duration} min)
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-700 border-red-200 hover:border-red-300 transition-colors"
                    onClick={async () => {
                      toast.error(
                        "Booking cancellation will be available in a future update."
                      );
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}