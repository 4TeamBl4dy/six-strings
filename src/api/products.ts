import axios, { AxiosError, AxiosResponse } from 'axios';
import { Guitar } from '../types/product';

const API_BASE_URL = 'http://localhost:8080/guitars'; // Main endpoint for guitars

const handleApiError = (error: AxiosError | Error, defaultMessage: string, context?: string): string => {
  const messageContext = context ? ` during ${context}` : '';
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    console.error(`Axios error${messageContext}:`, axiosError.toJSON());
    if (axiosError.response) {
      return (axiosError.response.data as { message?: string })?.message || defaultMessage;
    } else if (axiosError.request) {
      return `Нет ответа от сервера${messageContext}. Проверьте ваше интернет-соединение.`;
    }
  } else {
    console.error(`Generic error${messageContext}:`, error.message);
  }
  return error.message || defaultMessage;
};

export const getGuitars = async (): Promise<Guitar[]> => {
  try {
    const response: AxiosResponse<Guitar[]> = await axios.get(API_BASE_URL);
    return response.data || [];
  } catch (err) {
    throw new Error(handleApiError(err as AxiosError, 'Не удалось загрузить гитары.', 'fetching all guitars'));
  }
};

/**
 * Fetches popular guitars.
 * @returns Promise resolving to Guitar[].
 */
export const getPopularGuitars = async (): Promise<Guitar[]> => {
  try {
    // Note: Original HomePage.tsx used fetch for this. Switched to axios for consistency.
    const response: AxiosResponse<Guitar[]> = await axios.get(`${API_BASE_URL}/popular`);
    return response.data || [];
  } catch (err) {
    throw new Error(handleApiError(err as AxiosError, 'Не удалось загрузить популярные гитары.', 'fetching popular guitars'));
  }
};
