"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { User } from "@/lib/db/user";
import { HomeHeader } from "@/components/home/Header";
import { AvailableTimeSlots } from "@/components/home/AvailableTimeSlots";
import { BookingDetails } from "@/components/home/BookingDetails";
import { UserBookings } from "@/components/home/UserBookings";
import { useBooking } from "@/hooks/useBooking";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 9); // 9 AM–8 PM
const TIME_SLOTS = ["00", "30"];

interface BookingCalendarProps {
  currentUser: User | null;
}

export default function BookingCalendar({ currentUser }: BookingCalendarProps) {
  const [date, setDate] = useState(new Date());
  const [duration, setDuration] = useState<"30" | "60">("30");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  const {
    isTimeSlotBooked,
    isTimeSlotDisabled,
    handleBooking,
    getTournamentForDate,
    userBookings,
  } = useBooking(date, currentUser);

  return (
    <div className="space-y-6">
      <HomeHeader date={date} setDate={setDate} />

      {getTournamentForDate().length > 0 && (
        <div className="rounded-lg border p-4 bg-[var(--muted)] text-[var(--muted-foreground)] shadow-sm mb-4">
          <div className="flex items-center justify-center gap-3">
            <Info className="h-5 w-5 mt-1 text-[var(--accent-foreground)]" />
            <div>
              <h4 className="font-semibold text-base text-[var(--accent-foreground)]">
                Tournament Day
              </h4>
              <p className="text-sm mt-1">
                There{" "}
                {getTournamentForDate().length === 1
                  ? "is a tournament"
                  : "are tournaments"}{" "}
                scheduled for this day.
              </p>
            </div>
          </div>
        </div>
      )}

      {!currentUser && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Login Required</AlertTitle>
          <AlertDescription>
            Please create a user profile to book.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AvailableTimeSlots
          hours={HOURS}
          timeSlots={TIME_SLOTS}
          date={date}
          currentUser={currentUser}
          selectedTimeSlot={selectedTimeSlot}
          setSelectedTimeSlot={setSelectedTimeSlot}
          isTimeSlotBooked={isTimeSlotBooked}
          isTimeSlotDisabled={(h, m) => isTimeSlotDisabled(h, m, duration)}
        />

        <BookingDetails
          date={date}
          selectedTimeSlot={selectedTimeSlot}
          duration={duration}
          setDuration={setDuration}
          currentUser={currentUser}
          handleBooking={() =>
            handleBooking(selectedTimeSlot, duration, () =>
              setSelectedTimeSlot(null)
            )
          }
        />
      </div>

      <UserBookings currentUser={currentUser} userBookings={userBookings} />
    </div>
  );
}
