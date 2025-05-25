import instance from './instance';

interface PaymentRequestBody {
   amount: number;
   paymentMethodId: string;
}

interface PaymentResponse {
   success: boolean;
   transactionId?: string;
   // other fields if any
}
// The payment endpoint in PaymentModal.tsx is '/pay'. It's not namespaced under /user or /saler.
export const processPayment = (data: PaymentRequestBody) => instance.post<PaymentResponse>('/pay', data);
