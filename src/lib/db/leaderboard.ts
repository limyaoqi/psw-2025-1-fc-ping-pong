import { DB_NAME } from "./dbConfig";
import { User } from "./user";
import { Booking } from "./booking";
import { Tournament } from "./tournament";

export interface LeaderboardEntry {
  username: string;
  playTime: number;
  bookings: number;
  tournaments: number;
}

export async function getMostActiveUsers(
  period: "week" | "month" | "quarter" | "year"
): Promise<LeaderboardEntry[]> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(["users", "bookings", "tournaments"], "readonly");
      const usersStore = transaction.objectStore("users");
      const bookingsStore = transaction.objectStore("bookings");
      const tournamentsStore = transaction.objectStore("tournaments");

      // Get current date and calculate cutoff date based on period
      const now = new Date();
      const startDate = new Date();

      switch (period) {
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          startDate.setMonth(now.getMonth() - 3);
          break;
        case "year":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Get all users
      const getUsersRequest = usersStore.getAll();
      
      getUsersRequest.onsuccess = () => {
        // const users = getUsersRequest.result || [];
        
        // Get all bookings
        const getBookingsRequest = bookingsStore.getAll();
        
        getBookingsRequest.onsuccess = () => {
          const bookings: Booking[] = getBookingsRequest.result || [];
          
          // Filter bookings by date range
          const filteredBookings = bookings.filter((booking) => {
            // Use startTime for filtering
            const bookingDate = new Date(booking.startTime);
            return bookingDate >= startDate && bookingDate <= now;
          });
          
          // Get all tournaments
          const getTournamentsRequest = tournamentsStore.getAll();
          
          getTournamentsRequest.onsuccess = () => {
            const tournaments: Tournament[] = getTournamentsRequest.result || [];
            
            // Filter tournaments by date range
            const filteredTournaments = tournaments.filter((tournament) => {
              if (!tournament.startDate) return false;
              const tournamentDate = new Date(tournament.startDate);
              return tournamentDate >= startDate && tournamentDate <= now;
            });
            
            // Create leaderboard data
            const userMap = new Map<string, LeaderboardEntry>();
            
            // Process bookings
            filteredBookings.forEach((booking) => {
              const username = booking.username;
              const startTime = new Date(booking.startTime);
              const endTime = new Date(booking.endTime);
              const playTime = (endTime.getTime() - startTime.getTime()) / (1000 * 60); // in minutes
              
              if (userMap.has(username)) {
                const entry = userMap.get(username)!;
                entry.playTime += playTime;
                entry.bookings += 1;
              } else {
                userMap.set(username, {
                  username,
                  playTime,
                  bookings: 1,
                  tournaments: 0,
                });
              }
            });
            
            // Process tournaments
            filteredTournaments.forEach((tournament) => {
              tournament.participants.forEach((username) => {
                if (userMap.has(username)) {
                  const entry = userMap.get(username)!;
                  entry.tournaments += 1;
                } else {
                  userMap.set(username, {
                    username,
                    playTime: 0,
                    bookings: 0,
                    tournaments: 1,
                  });
                }
              });
            });
            
            // Convert map to array and sort by play time
            const leaderboard = Array.from(userMap.values())
              .sort((a, b) => b.playTime - a.playTime);
            
            resolve(leaderboard);
          };
          
          getTournamentsRequest.onerror = () => reject(new Error("Failed to get tournaments"));
        };
        
        getBookingsRequest.onerror = () => reject(new Error("Failed to get bookings"));
      };
      
      getUsersRequest.onerror = () => reject(new Error("Failed to get users"));
      
      transaction.oncomplete = () => db.close();
    };
    
    request.onerror = () => reject(new Error("Could not open database"));
  });
}