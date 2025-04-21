import { DB_NAME } from "./dbConfig";

export interface Booking {
  id: string;
  username: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  createdAt: Date;
}
export async function addBooking(booking: Booking): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(["bookings", "users"], "readwrite");
      const bookingsStore = transaction.objectStore("bookings");
      const usersStore = transaction.objectStore("users");

      // Add booking
      const addBookingRequest = bookingsStore.add(booking);

      addBookingRequest.onsuccess = () => {
        // Update user's bookings
        const getUserRequest = usersStore.get(booking.username);

        getUserRequest.onsuccess = () => {
          const user = getUserRequest.result;
          if (user) {
            user.bookings.push(booking.id);
            user.totalBookings += 1;

            const updateUserRequest = usersStore.put(user);
            updateUserRequest.onsuccess = () => resolve(booking.id);
            updateUserRequest.onerror = () =>
              reject(new Error("Failed to update user"));
          } else {
            reject(new Error("User not found"));
          }
        };

        getUserRequest.onerror = () => reject(new Error("Failed to get user"));
      };

      addBookingRequest.onerror = () =>
        reject(new Error("Failed to add booking"));

      transaction.oncomplete = () => db.close();
    };

    request.onerror = () => reject(new Error("Could not open database"));
  });
}

export async function getBookingsByDate(date: string): Promise<Booking[]> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(["bookings"], "readonly");
      const store = transaction.objectStore("bookings");
      const index = store.index("date");

      const getRequest = index.getAll(date);

      getRequest.onsuccess = () => resolve(getRequest.result || []);
      getRequest.onerror = () => reject(new Error("Failed to get bookings"));

      transaction.oncomplete = () => db.close();
    };

    request.onerror = () => reject(new Error("Could not open database"));
  });
}

export async function getUserBookings(username: string): Promise<Booking[]> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(["bookings"], "readonly");
      const store = transaction.objectStore("bookings");
      const index = store.index("username");

      const getRequest = index.getAll(username);

      getRequest.onsuccess = () => resolve(getRequest.result || []);
      getRequest.onerror = () =>
        reject(new Error("Failed to get user bookings"));

      transaction.oncomplete = () => db.close();
    };

    request.onerror = () => reject(new Error("Could not open database"));
  });
}

export async function deleteBooking(
  id: string,
  username: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(["bookings", "users"], "readwrite");
      const bookingsStore = transaction.objectStore("bookings");
      const usersStore = transaction.objectStore("users");

      // Delete booking
      const deleteRequest = bookingsStore.delete(id);

      deleteRequest.onsuccess = () => {
        // Update user's bookings
        const getUserRequest = usersStore.get(username);

        getUserRequest.onsuccess = () => {
          const user = getUserRequest.result;
          if (user) {
            user.bookings = user.bookings.filter(
              (bookingId: string) => bookingId !== id
            );

            const updateUserRequest = usersStore.put(user);
            updateUserRequest.onsuccess = () => resolve();
            updateUserRequest.onerror = () =>
              reject(new Error("Failed to update user"));
          } else {
            reject(new Error("User not found"));
          }
        };

        getUserRequest.onerror = () => reject(new Error("Failed to get user"));
      };

      deleteRequest.onerror = () =>
        reject(new Error("Failed to delete booking"));

      transaction.oncomplete = () => db.close();
    };

    request.onerror = () => reject(new Error("Could not open database"));
  });
}
