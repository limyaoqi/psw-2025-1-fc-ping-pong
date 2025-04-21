// import { format, addHours, isSameDay } from "date-fns"
// import { Button } from "@/components/ui/button"
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// import { cn } from "@/lib/utils"
// import { Booking } from "@/lib/db/booking"
// import { Tournament } from "@/lib/db/tournament"

// // Define constants for time slots
// const HOURS = Array.from({ length: 12 }, (_, i) => i + 9) // 9 AM to 8 PM
// const TIME_SLOTS = ["00", "30"] // 30-minute intervals

// interface TimeSlotGridProps {
//   date: Date
//   bookings: Booking[]
//   tournaments: Tournament[]
//   duration: "30" | "60"
//   selectedTimeSlot: string | null
//   setSelectedTimeSlot: (timeSlot: string | null) => void
// }

// export default function TimeSlotGrid({
//   date,
//   bookings,
//   tournaments,
//   duration,
//   selectedTimeSlot,
//   setSelectedTimeSlot
// }: TimeSlotGridProps) {
//   const isTimeSlotBooked = (hour: number, minute: string) => {
//     const slotTime = new Date(date)
//     slotTime.setHours(hour, Number.parseInt(minute), 0, 0)

//     // Check regular bookings
//     const isBooked = bookings.some((booking) => {
//       const bookingStart = new Date(booking.startTime)
//       const bookingEnd = new Date(booking.endTime)
//       return slotTime >= bookingStart && slotTime < bookingEnd
//     })

//     // Check tournament bookings
//     const isTournamentTime = tournaments.some((tournament) => {
//       if (!tournament.startTime || !tournament.endTime) return false

//       const tournamentStart = new Date(tournament.startTime)
//       const tournamentEnd = new Date(tournament.endTime)
//       return isSameDay(slotTime, tournamentStart) && slotTime >= tournamentStart && slotTime < tournamentEnd
//     })

//     return isBooked || isTournamentTime
//   }

//   const isTimeSlotDisabled = (hour: number, minute: string) => {
//     // Check if this time slot is already booked
//     if (isTimeSlotBooked(hour, minute)) return true

//     // For 1-hour bookings, also check if the next slot is booked
//     if (duration === "60" && minute === "30") {
//       return isTimeSlotBooked(hour + 1, "00")
//     } else if (duration === "60" && minute === "00") {
//       return isTimeSlotBooked(hour, "30")
//     }

//     return false
//   }

//   return (
//     <div className="grid grid-cols-4 gap-2">
//       {HOURS.map((hour) =>
//         TIME_SLOTS.map((minute) => {
//           const formattedTime = `${hour}:${minute}`
//           const displayTime = format(
//             addHours(new Date().setHours(hour, Number.parseInt(minute), 0, 0), 0),
//             "h:mm a",
//           )
//           const isBooked = isTimeSlotBooked(hour, minute)
//           const isDisabled = isTimeSlotDisabled(hour, minute)

//           return (
//             <TooltipProvider key={`${hour}-${minute}`}>
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <Button
//                     variant={
//                       selectedTimeSlot === formattedTime ? "default" : isBooked ? "outline" : "secondary"
//                     }
//                     className={cn(
//                       "h-12 w-full",
//                       isBooked && "bg-muted text-muted-foreground cursor-not-allowed opacity-50",
//                       isDisabled && !isBooked && "bg-muted/50 text-muted-foreground cursor-not-allowed",
//                     )}
//                     disabled={isDisabled}
//                     onClick={() => {
//                       if (!isDisabled) {
//                         setSelectedTimeSlot(formattedTime)
//                       }
//                     }}
//                   >
//                     {displayTime}
//                   </Button>
//                 </TooltipTrigger>
//                 <TooltipContent>
//                   {isBooked
//                     ? "Already booked"
//                     : isDisabled
//                       ? "Not available for selected duration"
//                       : "Available"}
//                 </TooltipContent>
//               </Tooltip>
//             </TooltipProvider>
//           )
//         }),
//       )}
//     </div>
//   )
// }

import { format, addHours } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TimeSlotGridProps {
  date: Date;
  selectedTimeSlot: string | null;
  setSelectedTimeSlot: (slot: string | null) => void;
  isTimeSlotBooked: (hour: number, minute: string) => boolean;
  isTimeSlotDisabled: (hour: number, minute: string) => boolean;
}

export default function TimeSlotGrid({
  date,
  selectedTimeSlot,
  setSelectedTimeSlot,
  isTimeSlotBooked,
  isTimeSlotDisabled,
}: TimeSlotGridProps) {
  const HOURS = Array.from({ length: 12 }, (_, i) => i + 9); // 9 AM to 8 PM
  const TIME_SLOTS = ["00", "30"]; // 30-minute intervals

  return (
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
                        disabled={isDisabled}
                        onClick={() => {
                          if (!isDisabled) {
                            setSelectedTimeSlot(formattedTime);
                          }
                        }}
                      >
                        {displayTime}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isBooked
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
  );
}