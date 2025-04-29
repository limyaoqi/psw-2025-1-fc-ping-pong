"use client";

import { format, addHours } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TimeSlotGridProps {
  hours: number[];
  timeSlots: string[];
  date: Date;
  currentUser: any | null;
  selectedTimeSlot: string | null;
  setSelectedTimeSlot: (slot: string) => void;
  isTimeSlotBooked: (hour: number, minute: string) => boolean;
  isTimeSlotDisabled: (hour: number, minute: string) => boolean;
}

export function TimeSlotGrid({
  hours,
  timeSlots,
  //   date,
  currentUser,
  selectedTimeSlot,
  setSelectedTimeSlot,
  isTimeSlotBooked,
  isTimeSlotDisabled,
}: TimeSlotGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {hours.map((hour) =>
        timeSlots.map((minute) => {
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
                    className={cn(
                      "h-12 w-full border",
                      selectedTimeSlot === formattedTime &&
                        "bg-primary text-primary-foreground",
                      isBooked &&
                        "bg-muted text-muted-foreground cursor-not-allowed opacity-50",
                      !isBooked &&
                        isDisabled &&
                        "bg-muted/50 text-muted-foreground cursor-not-allowed",
                      !isBooked &&
                        !isDisabled &&
                        selectedTimeSlot !== formattedTime &&
                        "border-secondary bg-[var(--button-bg)] text-[var(--button-text)] hover:bg-[var(--button-hover-bg)]"
                    )}
                    style={{ borderColor: "var(--secondary)" }}
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
  );
}
