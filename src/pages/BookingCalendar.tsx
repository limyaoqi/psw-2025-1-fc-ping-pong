"use client";

import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { format, addDays, startOfWeek, addHours, isSameDay } from "date-fns";
import { CalendarIcon, Clock, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { v4 as uuidv4 } from "uuid"; // You'll need to install this package

// Import your actual database functions
import { User } from "@/lib/db/user";
import {
  addBooking,
  getBookingsByDate,
  getUserBookings,
  Booking,
} from "@/lib/db/booking";
import { getTournaments, Tournament } from "@/lib/db/tournament";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 9); // 9 AM to 8 PM
const TIME_SLOTS = ["00", "30"]; // 30-minute intervals

interface BookingCalendarProps {
  currentUser: User | null;
}

export default function BookingCalendar({ currentUser }: BookingCalendarProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [duration, setDuration] = useState<"30" | "60">("30");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get bookings for the selected date
        const dateString = format(date, "yyyy-MM-dd");
        const dateBookings = await getBookingsByDate(dateString);
        setBookings(dateBookings);

        // Get user's bookings if user is logged in
        if (currentUser) {
          const usrBookings = await getUserBookings(currentUser.username);
          setUserBookings(usrBookings);
        } else {
          setUserBookings([]);
        }

        const tournamentData = await getTournaments();
        setTournaments(tournamentData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data. Please try again.");
      }
    };

    fetchData();
  }, [date, currentUser]); // Re-fetch when date or currentUser changes

  const refreshBookings = async () => {
    if (!currentUser) return;

    const dateString = format(date, "yyyy-MM-dd");
    const dateBookings = await getBookingsByDate(dateString);
    setBookings(dateBookings);

    const usrBookings = await getUserBookings(currentUser.username);
    setUserBookings(usrBookings);
  };

  // Rest of your component remains the same...

  const isTimeSlotBooked = (hour: number, minute: string) => {
    const slotTime = new Date(date);
    slotTime.setHours(hour, Number.parseInt(minute), 0, 0);

    // Check regular bookings
    const isBooked = bookings.some((booking) => {
      const bookingStart = new Date(booking.date + "T" + booking.startTime);
      const bookingEnd = new Date(booking.date + "T" + booking.endTime);
      return slotTime >= bookingStart && slotTime < bookingEnd;
    });

    // Check tournament bookings
    const isTournamentTime = tournaments.some((tournament) => {
      if (!tournament.startDate || !tournament.endDate) return false;

      const tournamentStart = new Date(tournament.startDate);
      const tournamentEnd = new Date(tournament.endDate);
      return (
        isSameDay(slotTime, tournamentStart) &&
        slotTime >= tournamentStart &&
        slotTime < tournamentEnd
      );
    });

    return isBooked || isTournamentTime;
  };

  const isTimeSlotDisabled = (hour: number, minute: string) => {
    // Check if this time slot is already booked
    if (isTimeSlotBooked(hour, minute)) return true;

    // For 1-hour bookings, also check if the next slot is booked
    if (duration === "60" && minute === "30") {
      return isTimeSlotBooked(hour + 1, "00");
    } else if (duration === "60" && minute === "00") {
      return isTimeSlotBooked(hour, "30");
    }

    return false;
  };

  const handleBooking = async () => {
    if (!currentUser || !selectedTimeSlot) return;

    // Parse the selected time slot
    const [hourStr, minuteStr] = selectedTimeSlot.split(":");
    const hour = Number.parseInt(hourStr);
    const minute = Number.parseInt(minuteStr);

    // Create start and end times
    const startTime = new Date(date);
    startTime.setHours(hour, minute, 0, 0);

    const endTime = new Date(startTime);
    if (duration === "30") {
      endTime.setMinutes(endTime.getMinutes() + 30);
    } else {
      endTime.setHours(endTime.getHours() + 1);
    }

    // Check booking policies
    // 1. Max 2 hours per day
    const bookingsToday = userBookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      return isSameDay(bookingDate, date);
    });

    const totalMinutesToday = bookingsToday.reduce((total, booking) => {
      return total + booking.duration;
    }, 0);

    const newDurationMinutes = duration === "30" ? 30 : 60;
    if (totalMinutesToday + newDurationMinutes > 120) {
      toast.error("You can only book up to 2 hours per day.");
      return;
    }

    // 2. No more than 3 bookings per week
    const startOfCurrentWeek = startOfWeek(date);
    const endOfCurrentWeek = addDays(startOfCurrentWeek, 7);

    const bookingsThisWeek = userBookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      return (
        bookingDate >= startOfCurrentWeek && bookingDate < endOfCurrentWeek
      );
    });

    if (bookingsThisWeek.length >= 3) {
      toast.error("You can only make up to 3 bookings per week.");
      return;
    }

    // Create the booking using your interface structure
    try {
      const newBooking: Booking = {
        id: uuidv4(),
        username: currentUser.username,
        date: format(date, "yyyy-MM-dd"),
        startTime:
          startTime.getHours().toString().padStart(2, "0") +
          ":" +
          startTime.getMinutes().toString().padStart(2, "0"),
        endTime:
          endTime.getHours().toString().padStart(2, "0") +
          ":" +
          endTime.getMinutes().toString().padStart(2, "0"),
        duration: newDurationMinutes,
        createdAt: new Date(),
      };

      await addBooking(newBooking);

      toast.success(
        `You've booked the table for ${format(startTime, "h:mm a")} - ${format(
          endTime,
          "h:mm a"
        )}`
      );

      // Reset selection and refresh bookings
      setSelectedTimeSlot(null);
      refreshBookings();
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("There was an error creating your booking.");
    }
  };

  const getTournamentForDate = () => {
    return tournaments.filter((tournament) => {
      if (!tournament.startDate) return false;
      const tournamentDate = new Date(tournament.startDate);
      return isSameDay(tournamentDate, date);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-start">
            Table Reservations
          </h1>
          <p className="text-muted-foreground text-start pl-2">
            Book the ping pong table for your play time.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                className="bg-[var(--background)]"
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {getTournamentForDate().length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Tournament Day</AlertTitle>
          <AlertDescription>
            There{" "}
            {getTournamentForDate().length === 1
              ? "is a tournament"
              : "are tournaments"}{" "}
            scheduled for this day. Some time slots may be reserved.
          </AlertDescription>
        </Alert>
      )}

      {!currentUser && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Login Required</AlertTitle>
          <AlertDescription>
            Please create a user profile to book the table.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Available Time Slots</CardTitle>
            <CardDescription>
              Select a time slot to book the table
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {HOURS.map((hour) =>
                TIME_SLOTS.map((minute) => {
                  const formattedTime = `${hour}:${minute}`;
                  const displayTime = format(
                    addHours(
                      new Date().setHours(hour, Number.parseInt(minute), 0, 0),
                      0
                    ),
                    "h:mm a"
                  );
                  const isBooked = isTimeSlotBooked(hour, minute);
                  const isDisabled = isTimeSlotDisabled(hour, minute);

                  return (
                    <TooltipProvider key={`${hour}-${minute}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={
                              selectedTimeSlot === formattedTime
                                ? "default"
                                : isBooked
                                ? "outline"
                                : "secondary"
                            }
                            className={cn(
                              "h-12 w-full",
                              isBooked &&
                                "bg-muted text-muted-foreground cursor-not-allowed opacity-50",
                              isDisabled &&
                                !isBooked &&
                                "bg-muted/50 text-muted-foreground cursor-not-allowed"
                            )}
                            disabled={isDisabled || !currentUser}
                            onClick={() => {
                              if (!isDisabled && currentUser) {
                                setSelectedTimeSlot(formattedTime);
                              }
                            }}
                          >
                            {displayTime}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {!currentUser
                            ? "Login required"
                            : isBooked
                            ? "Already booked"
                            : isDisabled
                            ? "Not available for selected duration"
                            : "Available"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

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
                <SelectTrigger id="duration" className="w-full">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="bg-black text-white">
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Bookings</CardTitle>
          <CardDescription>View your upcoming reservations</CardDescription>
        </CardHeader>
        <CardContent>
          {!currentUser ? (
            <p className="text-muted-foreground">
              Please log in to see your bookings.
            </p>
          ) : userBookings.length === 0 ? (
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
                      onClick={async () => {
                        // Cancel booking logic would go here
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
    </div>
  );
}
