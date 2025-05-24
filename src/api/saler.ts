import axios, { AxiosResponse, AxiosError } from 'axios';
import { SalerPublicProfile } from '../types/saler';

const API_BASE_URL = 'http://localhost:8080'; // Should be in a config file ideally

// Helper to get the token
const getToken = (): string | null => localStorage.getItem('access_token');

// General error handler for saler API calls
const handleSalerApiError = (error: AxiosError, context: string): string => {
  console.error(`Error during ${context}:`, error);
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      if (status === 401) {
        return 'Ошибка авторизации. Пожалуйста, войдите снова.';
      }
      if (status === 404) {
        return `Продавец не найден при ${context}.`;
      }
      return axiosError.response.data?.message || axiosError.response.data?.error || `Ошибка сервера (${status}) при ${context}.`;
    } else if (axiosError.request) {
      return `Ошибка сети при ${context}. Проверьте подключение.`;
    }
  }
  return `Неизвестная ошибка при ${context}.`;
};

/**
 * Fetches the current saler's profile data.
 * (Corresponds to /saler endpoint used in SalerProfilePage and SalerDashboard)
 * @returns Promise resolving to SalerPublicProfile.
 */
export const getSalerProfile = async (): Promise<SalerPublicProfile> => {
  const token = getToken();
  if (!token) {
    throw new Error('Продавец не авторизован.');
  }
  try {
    const response: AxiosResponse<SalerPublicProfile> = await axios.get(`${API_BASE_URL}/saler`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(handleSalerApiError(error as AxiosError, 'получении профиля продавца'));
  }
};

/**
 * Updates the current saler's profile data.
 * FormData can include fields from SalerPublicProfile and optionally 'password'.
 * @param formData FormData containing saler data to update.
 * @returns Promise resolving to updated SalerPublicProfile.
 */
export const updateSalerProfile = async (formData: FormData): Promise<SalerPublicProfile> => {
  const token = getToken();
  if (!token) {
    throw new Error('Продавец не авторизован.');
  }
  try {
    const response: AxiosResponse<SalerPublicProfile> = await axios.put(`${API_BASE_URL}/saler`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    // If the server sends back a new token in headers
    if (response.headers.authorization) {
      localStorage.setItem('access_token', response.headers.authorization.split(' ')[1]);
    }
    return response.data;
  } catch (error) {
    throw new Error(handleSalerApiError(error as AxiosError, 'обновлении профиля продавца'));
  }
};

/**
 * Fetches public information for a specific saler by login.
 * (Corresponds to /saler_info?login=sellerLogin used in SalerProductPage)
 * @param login The login of the saler.
 * @returns Promise resolving to SalerPublicProfile.
 */
export const getSalerPublicInfo = async (login: string): Promise<SalerPublicProfile> => {
  try {
    // This endpoint seems public, no token needed based on original SalerProductPage.tsx
    const response: AxiosResponse<SalerPublicProfile> = await axios.get(`${API_BASE_URL}/saler_info?login=${login}`);
    return response.data;
  } catch (error) {
    throw new Error(handleSalerApiError(error as AxiosError, `получении публичной информации о продавце ${login}`));
  }
};
