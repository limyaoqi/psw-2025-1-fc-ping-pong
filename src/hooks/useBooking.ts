import { useState, useEffect } from "react";
import { format, isSameDay, startOfWeek, addDays } from "date-fns";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Booking, getBookingsByDate, getUserBookings, addBooking } from "@/lib/db/booking";
import { Tournament, getTournaments } from "@/lib/db/tournament";
import { User } from "@/lib/db/user";

export function useBooking(date: Date, currentUser: User | null) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dateStr = format(date, "yyyy-MM-dd");
        setBookings(await getBookingsByDate(dateStr));
        setTournaments(await getTournaments());
        if (currentUser) {
          setUserBookings(await getUserBookings(currentUser.username));
        } else {
          setUserBookings([]);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data.");
      }
    };
    fetchData();
  }, [date, currentUser]);

  const refreshBookings = async () => {
    const dateStr = format(date, "yyyy-MM-dd");
    setBookings(await getBookingsByDate(dateStr));
    if (currentUser) {
      setUserBookings(await getUserBookings(currentUser.username));
    }
  };

  const isTimeSlotBooked = (hour: number, minute: string) => {
    const slot = new Date(date);
    slot.setHours(hour, +minute, 0, 0);

    const booked = bookings.some(({ date: d, startTime, endTime }) => {
      const start = new Date(`${d}T${startTime}`);
      const end = new Date(`${d}T${endTime}`);
      return slot >= start && slot < end;
    });

    const conflictWithTournament = tournaments.some((t) => {
      if (!t.startDate || !t.endDate) return false;
      const start = new Date(t.startDate);
      const end = new Date(t.endDate);
      return isSameDay(slot, start) && slot >= start && slot < end;
    });

    return booked || conflictWithTournament;
  };

  const isTimeSlotDisabled = (hour: number, minute: string, duration: "30" | "60") => {
    if (isTimeSlotBooked(hour, minute)) return true;
    if (duration === "60") {
      if (minute === "00") return isTimeSlotBooked(hour, "30");
      if (minute === "30") return isTimeSlotBooked(hour + 1, "00");
    }
    return false;
  };

  const getTournamentForDate = () => {
    return tournaments.filter((t) => t.startDate && isSameDay(new Date(t.startDate), date));
  };

  const handleBooking = async (
    selectedTimeSlot: string | null,
    duration: "30" | "60",
    resetSlot: () => void
  ) => {
    if (!currentUser || !selectedTimeSlot) {
      console.log("No current user or no time slot selected", { currentUser, selectedTimeSlot });
      return;
    }
    
    const [h, m] = selectedTimeSlot.split(":").map(Number);
    const start = new Date(date);
    start.setHours(h, m, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + (duration === "30" ? 30 : 60));
    
    const minutesToday = userBookings
      .filter((b) => isSameDay(new Date(b.date), date))
      .reduce((sum, b) => sum + b.duration, 0);
    
    console.log("Current bookings today:", {
      minutesToday,
      filterBookings: userBookings.filter((b) => isSameDay(new Date(b.date), date))
    });
    
    const minutesToAdd = duration === "30" ? 30 : 60;
    
    if (minutesToday + minutesToAdd > 120) {
      console.log("Daily limit reached", { minutesToday, minutesToAdd });
      toast.error("You can only book up to 2 hours per day.");
      return;
    }
    
    const weekStart = startOfWeek(date);
    const weekEnd = addDays(weekStart, 7);
    const bookingsThisWeek = userBookings.filter((b) => {
      const d = new Date(b.date);
      return d >= weekStart && d < weekEnd;
    });
    
    console.log("Weekly bookings check:", {
      bookingsThisWeek: bookingsThisWeek.length,
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString()
    });
    
    if (bookingsThisWeek.length >= 3) {
      console.log("Weekly limit reached");
      toast.error("You can only make 3 bookings per week.");
      return;
    }
    
    const booking: Booking = {
      id: uuidv4(),
      username: currentUser.username,
      date: format(date, "yyyy-MM-dd"),
      startTime: format(start, "HH:mm"),
      endTime: format(end, "HH:mm"),
      duration: minutesToAdd,
      createdAt: new Date(),
    };
    
    console.log("Attempting to add booking:", booking);
    
    try {
      const bookingId = await addBooking(booking);
      console.log("Booking added successfully with ID:", bookingId);
      console.log("Complete booking data:", booking);
      
      toast.success(`Booked from ${format(start, "h:mm a")} to ${format(end, "h:mm a")}`);
      resetSlot();
      await refreshBookings();
      console.log("Bookings refreshed");
    } catch (err) {
      console.error("Booking error details:", err);
      toast.error("Booking failed.");
    }
  };

  return {
    bookings,
    tournaments,
    userBookings,
    isTimeSlotBooked,
    isTimeSlotDisabled,
    handleBooking,
    getTournamentForDate,
  };
}
