import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { processPayment, PaymentRequestBody, PaymentResponse } from 'src/api';

interface PaymentState {
  isLoading: boolean;
  error: string | null;
  paymentSuccessDetails: PaymentResponse | null; // Store the whole response for details
  transactionId: string | null; // Keep for quick access if needed elsewhere
}

const initialState: PaymentState = {
  isLoading: false,
  error: null,
  paymentSuccessDetails: null,
  transactionId: null,
};

export const processPaymentThunk = createAsyncThunk<PaymentResponse, PaymentRequestBody, { rejectValue: string }>(
  'payment/processPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await processPayment(paymentData);
      return response.data; // Assuming processPayment returns an AxiosResponse
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Payment processing failed');
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    resetPaymentState: (state) => {
      state.isLoading = false;
      state.error = null;
      state.paymentSuccessDetails = null;
      state.transactionId = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(processPaymentThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.paymentSuccessDetails = null;
        state.transactionId = null;
      })
      .addCase(processPaymentThunk.fulfilled, (state, action: PayloadAction<PaymentResponse>) => {
        state.isLoading = false;
        state.paymentSuccessDetails = action.payload;
        if (action.payload.success) {
          state.transactionId = action.payload.transactionId || null;
        } else {
           state.error = 'Payment was not successful.'; // Or use a message from payload if available
        }
      })
      .addCase(processPaymentThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.isLoading = false;
        state.error = action.payload || 'Payment failed';
        state.paymentSuccessDetails = null;
      });
  },
});

export const { resetPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;
