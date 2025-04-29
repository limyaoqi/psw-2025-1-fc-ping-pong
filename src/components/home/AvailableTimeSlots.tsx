"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TimeSlotGrid } from "@/components/home/TimeSlotGrid ";

interface AvailableTimeSlotsProps {
  hours: number[];
  timeSlots: string[];
  date: Date;
  currentUser: any | null;
  selectedTimeSlot: string | null;
  setSelectedTimeSlot: (slot: string) => void;
  isTimeSlotBooked: (hour: number, minute: string) => boolean;
  isTimeSlotDisabled: (hour: number, minute: string) => boolean;
}

export function AvailableTimeSlots({
  hours,
  timeSlots,
  date,
  currentUser,
  selectedTimeSlot,
  setSelectedTimeSlot,
  isTimeSlotBooked,
  isTimeSlotDisabled,
}: AvailableTimeSlotsProps) {
  return (
    <Card className="col-span-1 md:col-span-2 border-[8px] border-white rounded-md relative">
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-full w-[3px] bg-white z-0" />

      <CardHeader className="relative z-10 pb-2 text-white backdrop-blur-md bg-black/30 rounded-t-md">
        <CardTitle className="text-2xl font-bold">
          🏓 Available Time Slots
        </CardTitle>
        <CardDescription className="text-white/80">
          Select a time slot to book the table
        </CardDescription>
      </CardHeader>

      <CardContent>
        <TimeSlotGrid
          hours={hours}
          timeSlots={timeSlots}
          date={date}
          currentUser={currentUser}
          selectedTimeSlot={selectedTimeSlot}
          setSelectedTimeSlot={setSelectedTimeSlot}
          isTimeSlotBooked={isTimeSlotBooked}
          isTimeSlotDisabled={isTimeSlotDisabled}
        />
      </CardContent>
    </Card>
  );
}
