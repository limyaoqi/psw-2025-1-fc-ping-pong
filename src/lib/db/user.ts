import { DB_NAME } from "./dbConfig";

export interface User {
  username: string;
  bookings: string[];
  totalBookings: number;
  tournaments: string[];
  createdAt: Date;
}

export async function addUser(user: User): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(["users"], "readwrite");
      const store = transaction.objectStore("users");

      // Check if user already exists
      const getRequest = store.get(user.username);
      getRequest.onsuccess = () => {
        if (getRequest.result) {
          reject(new Error("User with this username already exists"));
          db.close();
          return;
        }
        const addRequest = store.add(user);
        addRequest.onsuccess = () => resolve();
        addRequest.onerror = () => reject(new Error("Failed to add user"));
      };

      getRequest.onerror = () => {
        reject(new Error("Failed to check existing user"));
        db.close();
      };

      transaction.oncomplete = () => db.close();
    };

    request.onerror = () => reject(new Error("Could not open database"));
  });
}

export async function getUser(username: string): Promise<User | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(["users"], "readonly");
      const store = transaction.objectStore("users");

      const getRequest = store.get(username);

      getRequest.onsuccess = () => resolve(getRequest.result || null);
      getRequest.onerror = () => reject(new Error("Failed to get user"));

      transaction.oncomplete = () => db.close();
    };

    request.onerror = () => reject(new Error("Could not open database"));
  });
}
