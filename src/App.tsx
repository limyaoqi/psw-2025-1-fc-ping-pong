import { useEffect, useState } from "react";

import "./App.css";
import { ThemeProvider } from "./components/theme-provider";

import { toast, Toaster } from "sonner";
import { initializeDatabase } from "./lib/db/dbConfig";
import Navbar from "./components/navbar/Navbar";
import BookingCalendar from "./pages/BookingCalendar";
import Leaderboard from "./pages/Leaderboard";
import Tournaments from "./pages/Tournaments";
import { User, getUser } from "./lib/db/user"; // Import User type and getUser function

function App() {
  const [activeTab, setActiveTab] = useState("bookings");
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const setupDb = async () => {
      try {
        await initializeDatabase();
        setIsDbInitialized(true);
      } catch (error) {
        console.error("Failed to initialize database:", error);
        toast.error("Failed to initialize the application database.");
      }
    };

    setupDb();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const savedUsername = localStorage.getItem("username");
        if (savedUsername) {
          const user = await getUser(savedUsername);
          setCurrentUser(user);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    if (isDbInitialized) {
      fetchUser();
    }
  }, [isDbInitialized]);

  return (
    <ThemeProvider defaultTheme="system" storageKey="ping-pong-theme">
      <div className="min-h-screen bg-background text-foreground">
        {isDbInitialized ? (
          <>
            <Navbar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              isLoadingUser={isLoadingUser}
            />
            <main className="container mx-auto py-6 px-4">
              {activeTab === "bookings" && (
                <BookingCalendar currentUser={currentUser} />
              )}
              {activeTab === "leaderboard" && <Leaderboard />}
              {activeTab === "tournaments" && <Tournaments />}
            </main>
          </>
        ) : (
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
        <Toaster position="top-center" richColors />
      </div>
    </ThemeProvider>
  );
}

export default App;
