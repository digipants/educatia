import Razorpay from 'razorpay';
import { MongoClient } from 'mongodb';
import { DB_NAME, DONATIONS_COLLECTION, MONGODB_URI, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from './constants';

let client: MongoClient | null = null;

export async function getDb() {
  if (!MONGODB_URI) throw new Error('Missing MONGODB_URI');
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }
  return client.db(DB_NAME);
}

export function getRazorpayClient() {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error('Missing Razorpay credentials');
  }
  return new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
}

export async function saveDonation(data: { amount: number; currency: string; status: string; orderId: string; email?: string }) {
  const db = await getDb();
  return db.collection(DONATIONS_COLLECTION).insertOne({ ...data, createdAt: new Date() });
}

