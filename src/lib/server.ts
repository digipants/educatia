import { MongoClient } from 'mongodb';
import { DB_NAME, DONATIONS_COLLECTION, MONGODB_URI } from './constants';

let client: MongoClient | null = null;
let pendingConnection: Promise<MongoClient> | null = null;

async function openClient(): Promise<MongoClient> {
  // Keep a small pool per warm serverless instance. A failed attempt must
  // never poison later requests or leave a partially opened client behind.
  const candidate = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 5000,
    waitQueueTimeoutMS: 5000,
    maxPoolSize: 5,
    minPoolSize: 0,
    maxIdleTimeMS: 30000
  });
  try {
    await candidate.connect();
    client = candidate;
    return candidate;
  } catch (error) {
    await candidate.close().catch(() => undefined);
    throw error;
  }
}

export async function getDb() {
  if (!MONGODB_URI?.trim()) throw new Error('Missing MONGODB_URI');
  if (!client) {
    // Concurrent requests share the same initial connection attempt.
    const attempt = pendingConnection ?? (pendingConnection = openClient());
    try {
      await attempt;
    } finally {
      if (pendingConnection === attempt) pendingConnection = null;
    }
  }
  if (!client) throw new Error('Database connection unavailable');
  return client.db(DB_NAME);
}

export async function saveDonation(data: { amount: number; currency: string; status: string; orderId: string; email?: string }) {
  const db = await getDb();
  return db.collection(DONATIONS_COLLECTION).insertOne({ ...data, createdAt: new Date() });
}
