import axios, { AxiosResponse, AxiosError } from 'axios';
import { UserProfile } from '../types/user';

const API_BASE_URL = 'http://localhost:8080'; // Should be in a config file ideally

// Helper to get the token
const getToken = (): string | null => localStorage.getItem('access_token');

// General error handler for user API calls
const handleUserApiError = (error: AxiosError, context: string): string => {
  console.error(`Error during ${context}:`, error);
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      if (status === 401) {
        // Unauthorized or token expired, could trigger logout
        return 'Ошибка авторизации. Пожалуйста, войдите снова.';
      }
      return axiosError.response.data?.message || axiosError.response.data?.error || `Ошибка сервера (${status}) при ${context}.`;
    } else if (axiosError.request) {
      return `Ошибка сети при ${context}. Проверьте подключение.`;
    }
  }
  return `Неизвестная ошибка при ${context}.`;
};

/**
 * Fetches the current user's profile data.
 * @returns Promise resolving to UserProfile.
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  const token = getToken();
  if (!token) {
    throw new Error('Пользователь не авторизован.');
  }
  try {
    const response: AxiosResponse<UserProfile> = await axios.get(`${API_BASE_URL}/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(handleUserApiError(error as AxiosError, 'получении профиля пользователя'));
  }
};

/**
 * Updates the current user's profile data.
 * FormData can include fields from UserProfile and optionally 'password'.
 * The server is expected to handle 'img' if it's a File object for avatar updates.
 * @param formData FormData containing user data to update.
 * @returns Promise resolving to updated UserProfile.
 */
export const updateUserProfile = async (formData: FormData): Promise<UserProfile> => {
  const token = getToken();
  if (!token) {
    throw new Error('Пользователь не авторизован.');
  }
  try {
    const response: AxiosResponse<UserProfile> = await axios.put(`${API_BASE_URL}/user`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data', // Important for file uploads
      },
    });
    // If the server sends back a new token in headers (e.g. after login change)
    if (response.headers.authorization) {
      localStorage.setItem('access_token', response.headers.authorization.split(' ')[1]);
    }
    return response.data;
  } catch (error) {
    throw new Error(handleUserApiError(error as AxiosError, 'обновлении профиля пользователя'));
  }
};

// Note: A separate updateUserPassword function might be desired if the endpoint is different
// or if password updates have different request/response structures.
// For now, updateUserProfile handles optional password in FormData as per ProfilePage.tsx.
