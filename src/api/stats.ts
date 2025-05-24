import axios, { AxiosResponse, AxiosError } from 'axios';
import { StatItem, DetailItem } from '../types/stats';

const API_BASE_URL = 'http://localhost:8080'; // Should be in a config file ideally

// Helper to get the token
const getToken = (): string | null => localStorage.getItem('access_token');

// General error handler for stats API calls
const handleStatsApiError = (error: AxiosError, context: string): string => {
  console.error(`Error during ${context}:`, error);
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      if (status === 401) {
        return 'Ошибка авторизации. Пожалуйста, войдите снова.';
      }
      return axiosError.response.data?.message || axiosError.response.data?.error || `Ошибка сервера (${status}) при ${context}.`;
    } else if (axiosError.request) {
      return `Ошибка сети при ${context}. Проверьте подключение.`;
    }
  }
  return `Неизвестная ошибка при ${context}.`;
};

// Interface for the expected overall stats response structure
export interface SalerStatsResponse {
  basket: StatItem[];
  favorites: StatItem[];
  basketDetails: DetailItem[];
  favoritesDetails: DetailItem[];
}

/**
 * Fetches statistics for the current saler.
 * @param sellerLogin The login of the seller for whom to fetch stats.
 * @returns Promise resolving to an object containing basket and favorites stats and details.
 */
export const getSalerStats = async (sellerLogin: string): Promise<SalerStatsResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('Продавец не авторизован.');
  }
  try {
    const response: AxiosResponse<SalerStatsResponse> = await axios.get(`${API_BASE_URL}/stats`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { sellerLogin },
    });
    return response.data;
  } catch (error) {
    throw new Error(handleStatsApiError(error as AxiosError, 'получении статистики продавца'));
  }
};
