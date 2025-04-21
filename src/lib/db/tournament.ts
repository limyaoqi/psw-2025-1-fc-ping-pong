import { DB_NAME } from "./dbConfig";

export interface Tournament {
  id: string;
  name: string;
  type: "singles" | "doubles";
  startDate: string;
  endDate: string;
  participants: string[];
  matches: TournamentMatch[];
  status: "upcoming" | "ongoing" | "completed";
  winner?: string | string[];
  createdBy: string;
  createdAt: Date;
}

export interface TournamentMatch {
  id: string;
  tournamentId: string;
  round: number;
  player1: string | null;
  player2: string | null;
  score1?: number;
  score2?: number;
  winner?: string;
  completed: boolean;
  scheduledTime?: string;
}

export async function addTournament(tournament: Tournament): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(["tournaments"], "readwrite");
      const store = transaction.objectStore("tournaments");

      const addRequest = store.add(tournament);

      addRequest.onsuccess = () => resolve(tournament.id);
      addRequest.onerror = () => reject(new Error("Failed to add tournament"));

      transaction.oncomplete = () => db.close();
    };

    request.onerror = () => reject(new Error("Could not open database"));
  });
}

export async function getTournaments(): Promise<Tournament[]> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(["tournaments"], "readonly");
      const store = transaction.objectStore("tournaments");

      const getRequest = store.getAll();

      getRequest.onsuccess = () => resolve(getRequest.result || []);
      getRequest.onerror = () => reject(new Error("Failed to get tournaments"));

      transaction.oncomplete = () => db.close();
    };

    request.onerror = () => reject(new Error("Could not open database"));
  });
}

export async function updateTournament(tournament: Tournament): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(["tournaments"], "readwrite");
      const store = transaction.objectStore("tournaments");

      const updateRequest = store.put(tournament);

      updateRequest.onsuccess = () => resolve();
      updateRequest.onerror = () =>
        reject(new Error("Failed to update tournament"));

      transaction.oncomplete = () => db.close();
    };

    request.onerror = () => reject(new Error("Could not open database"));
  });
}
