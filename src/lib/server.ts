import { MongoClient } from 'mongodb';
import { DB_NAME, DONATIONS_COLLECTION, MONGODB_URI } from './constants';

let client: MongoClient | null = null;

export async function getDb() {
  if (!MONGODB_URI) throw new Error('Missing MONGODB_URI');
  if (!client) {
    const candidate = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    await candidate.connect();
    client = candidate;
  }
  return client.db(DB_NAME);
}

export async function saveDonation(data: { amount: number; currency: string; status: string; orderId: string; email?: string }) {
  const db = await getDb();
  return db.collection(DONATIONS_COLLECTION).insertOne({ ...data, createdAt: new Date() });
}

