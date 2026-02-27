export interface Donation {
  amount: number;
  currency: string;
  status: 'created' | 'paid' | 'failed';
  orderId: string;
  email?: string;
  createdAt?: Date;
}
