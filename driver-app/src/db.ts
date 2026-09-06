import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface LCXDB extends DBSchema {
  routes: {
    key: number; // The day's timestamp or 1 for today
    value: { id: number, items: any[] };
  };
  mutations: {
    key: number;
    value: { id?: number, itemId: number, destination: string, timestamp: number };
  };
}

let dbPromise: Promise<IDBPDatabase<LCXDB>> | null = null;

export const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<LCXDB>('lcx-driver-db', 1, {
      upgrade(db) {
        db.createObjectStore('routes', { keyPath: 'id' });
        db.createObjectStore('mutations', { keyPath: 'id', autoIncrement: true });
      },
    });
  }
  return dbPromise;
};

export const saveRoute = async (items: any[]) => {
  const db = await getDB();
  await db.put('routes', { id: 1, items });
};

export const getRoute = async () => {
  const db = await getDB();
  const route = await db.get('routes', 1);
  return route ? route.items : null;
};

export const saveMutation = async (itemId: number, destination: string) => {
  const db = await getDB();
  await db.put('mutations', { itemId, destination, timestamp: Date.now() });
};

export const getMutations = async () => {
  const db = await getDB();
  return await db.getAll('mutations');
};

export const clearMutation = async (id: number) => {
  const db = await getDB();
  await db.delete('mutations', id);
};
