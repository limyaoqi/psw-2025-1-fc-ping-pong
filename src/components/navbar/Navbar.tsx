"use client";

import { useState } from "react";
import { addUser, User } from "@/lib/db/user";
import NavTabs from "./NavTabs";
import ThemeToggle from "./ThemeToggle";
import UserGreeting from "./UserGreeting";
import UserDialog from "./UserDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Calendar, MenuIcon, Trophy, Users } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isLoadingUser: boolean;
}

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  setCurrentUser,
  isLoadingUser 
}: NavbarProps) {
  const [newUserName, setNewUserName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(!currentUser && !isLoadingUser);

  const handleCreateUser = async () => {
    const trimmed = newUserName.trim();
    if (!trimmed) return;

    const newUser: User = {
      username: trimmed,
      bookings: [],
      totalBookings: 0,
      tournaments: [],
      createdAt: new Date(),
    };

    try {
      await addUser(newUser);
      setCurrentUser(newUser);
      localStorage.setItem("username", trimmed);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-[var(--background)]">
      <div className="container flex h-16 items-center justify-between py-4">
        {/* Logo */}
        <span className="text-xl font-bold whitespace-nowrap">
          FC Ping Pong
        </span>

        {/* NavTabs only on lg and up */}
        <nav className="hidden lg:flex items-center space-x-4">
          <NavTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {!isLoadingUser && currentUser && (
            <UserGreeting username={currentUser.username} />
          )}
          <ThemeToggle />

          {/* Menu for sm and md screens */}
          <div className="lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MenuIcon className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setActiveTab("bookings")}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Bookings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("tournaments")}>
                  <Trophy className="mr-2 h-4 w-4" />
                  Tournaments
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("leaderboard")}>
                  <Users className="mr-2 h-4 w-4" />
                  Leaderboard
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Dialog */}
      <UserDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        userName={newUserName}
        onChangeName={setNewUserName}
        onCreateUser={handleCreateUser}
      />
    </header>
  );
}