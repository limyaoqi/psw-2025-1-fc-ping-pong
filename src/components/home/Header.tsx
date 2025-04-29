"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HomeHeaderProps {
  date: Date;
  setDate: (date: Date) => void;
}

export function HomeHeader({ date, setDate }: HomeHeaderProps) {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0 md:items-center">
      <div>
      <h1 className="text-2xl font-bold tracking-tight text-start">
          Table Reservations
        </h1>
        <p className="text-muted-foreground text-start pl-2">
          Book the ping pong table for your play time.
        </p>
      </div>
      <div className="flex items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full md:w-[240px] justify-start text-left font-normal",
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
  );
}
