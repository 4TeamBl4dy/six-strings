import axios, { AxiosResponse, AxiosError } from 'axios';
import { AuthResponse, LoginCredentials, RegistrationData } from '../types/auth';

const API_BASE_URL = 'http://localhost:8080'; // Should be in a config file ideally

// General error handler for auth API calls
const handleAuthError = (error: AxiosError): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>; // More specific type for error response
    if (axiosError.response) {
      // Server responded with a status code out of 2xx range
      const status = axiosError.response.status;
      const responseData = axiosError.response.data;

      if (status === 401) { // Unauthorized or User not found
        return responseData?.message || responseData?.error || 'Пользователь с таким логином не найден или неверные данные.';
      } else if (status === 402) { // Specific for "Incorrect password" in original login code
        return responseData?.message || responseData?.error || 'Неверный пароль.';
      } else if (status === 409) { // Conflict, e.g., user already exists during registration
        return responseData?.message || responseData?.error || 'Пользователь с таким логином уже зарегистрирован.';
      }
      // Generic server error message
      return responseData?.message || responseData?.error || `Ошибка сервера: ${status}. Пожалуйста, попробуйте снова.`;
    } else if (axiosError.request) {
      // Request was made but no response received
      return 'Ошибка сети. Проверьте подключение и попробуйте снова.';
    }
  }
  // Other errors (e.g., setup error)
  return error.message || 'Произошла неизвестная ошибка. Пожалуйста, попробуйте снова.';
};

/**
 * Logs in a user or a saler.
 * @param credentials Login and password.
 * @param isSaler True if logging in as a saler, false for a regular user.
 * @returns Promise resolving to AuthResponse.
 */
export const login = async (credentials: LoginCredentials, isSaler: boolean): Promise<AuthResponse> => {
  const endpoint = isSaler ? `${API_BASE_URL}/login_saler` : `${API_BASE_URL}/login_user`;
  try {
    const response: AxiosResponse<AuthResponse> = await axios.post(endpoint, credentials);
    return response.data;
  } catch (error) {
    throw new Error(handleAuthError(error as AxiosError));
  }
};

/**
 * Registers a new user or a saler.
 * @param userData Name, login, password, phone.
 * @param isSaler True if registering as a saler, false for a regular user.
 * @returns Promise resolving to AuthResponse.
 */
export const register = async (userData: RegistrationData, isSaler: boolean): Promise<AuthResponse> => {
  const endpoint = isSaler ? `${API_BASE_URL}/register_saler` : `${API_BASE_URL}/register_user`;
  try {
    const response: AxiosResponse<AuthResponse> = await axios.post(endpoint, userData);
    return response.data;
  } catch (error) {
    // Specific handling for registration conflict (user already exists)
    if (axios.isAxiosError(error) && (error as AxiosError).response?.status === 401) {
       // Assuming 401 from /register_... means user exists, based on original Registration.tsx
       // The backend might better use 409 Conflict for this.
       throw new Error('Пользователь с таким логином уже зарегистрирован.');
    }
    throw new Error(handleAuthError(error as AxiosError));
  }
};
