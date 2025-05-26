export type DetailItem = {
  date: string;
  productId: string;
  productName: string;
  userId: string;
  userLogin: string;
};

export type StatItem = {
  _id: string;
  total: number;
};

export type PaymentItem = {
  _id: string;
  userId: string;
  amount: number;
  transactionId: string;
  status: string;
  createdAt: string;
};