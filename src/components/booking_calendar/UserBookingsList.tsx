import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Booking } from "@/lib/db/booking";

interface UserBookingsListProps {
  userBookings: Booking[];
}

export default function UserBookingsList({
  userBookings,
}: UserBookingsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Bookings</CardTitle>
        <CardDescription>View your upcoming reservations</CardDescription>
      </CardHeader>
      <CardContent>
        {userBookings.length === 0 ? (
          <p className="text-muted-foreground">
            You don't have any bookings yet.
          </p>
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
                  className="flex justify-between items-center p-3 border rounded-md"
                >
                  <div>
                    <p className="font-medium">
                      {format(new Date(booking.date), "EEEE, MMMM d")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.startTime} - {booking.endTime}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Cancel booking logic would go here
                      toast.error(
                        "Booking cancellation will be available in a future update."
                      );
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
