export const DB_NAME = 'PingPongBookingDB';
export const DB_VERSION = 1;

export async function initializeDatabase(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Database error:', event);
      reject(new Error('Could not open database'));
    };

    request.onsuccess = () => {
      console.log('Database opened successfully');
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('users')) {
        const usersStore = db.createObjectStore('users', { keyPath: 'username' });
        usersStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      if (!db.objectStoreNames.contains('bookings')) {
        const bookingsStore = db.createObjectStore('bookings', { keyPath: 'id' });
        bookingsStore.createIndex('username', 'username', { unique: false });
        bookingsStore.createIndex('date', 'date', { unique: false });
        bookingsStore.createIndex('startTime', 'startTime', { unique: false });
      }

      if (!db.objectStoreNames.contains('tournaments')) {
        const tournamentsStore = db.createObjectStore('tournaments', { keyPath: 'id' });
        tournamentsStore.createIndex('status', 'status', { unique: false });
        tournamentsStore.createIndex('startDate', 'startDate', { unique: false });
      }

      if (!db.objectStoreNames.contains('matches')) {
        const matchesStore = db.createObjectStore('matches', { keyPath: 'id' });
        matchesStore.createIndex('tournamentId', 'tournamentId', { unique: false });
      }
    };
  });
}
