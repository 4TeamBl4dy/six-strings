import axios, { AxiosError } from 'axios'; // Using axios for consistency, though original used fetch

const API_BASE_URL = 'http://localhost:8080'; // Should be in a config file ideally

// Helper to get the token
const getToken = (): string | null => localStorage.getItem('access_token');

// Define the expected structure of the payment request payload
export interface PaymentRequestBody {
  amount: number;
  paymentMethodId: string;
}

// Define the expected structure of a successful payment response
export interface PaymentResponse {
  success: boolean;
  transactionId?: string; // Assuming transactionId is optional in success response
  message?: string; // Optional message from server
}

// General error handler for payment API calls
const handlePaymentApiError = (error: any, context: string): string => {
  console.error(`Error during ${context}:`, error);
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string; detail?: string }>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      const responseData = axiosError.response.data;
      if (status === 401) {
        return 'Ошибка авторизации. Пожалуйста, войдите снова.';
      }
      // Use more specific error message from backend if available
      return responseData?.message || responseData?.error || responseData?.detail || `Ошибка сервера (${status}) при ${context}.`;
    } else if (axiosError.request) {
      return `Ошибка сети при ${context}. Проверьте подключение.`;
    }
  } else if (error instanceof Error) { // Handle generic errors if not AxiosError (e.g. from fetch)
    return error.message;
  }
  return `Неизвестная ошибка при ${context}.`;
};

/**
 * Processes a payment.
 * @param paymentData The amount and paymentMethodId.
 * @returns Promise resolving to an object indicating success and optionally a transactionId.
 */
export const processPayment = async (paymentData: PaymentRequestBody): Promise<PaymentResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('Пользователь не авторизован для совершения платежа.');
  }
  try {
    // Original used fetch, switching to axios for consistency with other API modules
    const response: AxiosResponse<PaymentResponse> = await axios.post(
      `${API_BASE_URL}/pay`,
      paymentData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    // If the error is from axios, handleAuthError will process it.
    // If it's from something else (e.g. network error before request), it will be a generic message.
    throw new Error(handlePaymentApiError(error, 'обработке платежа'));
  }
};
