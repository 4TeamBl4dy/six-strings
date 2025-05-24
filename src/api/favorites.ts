import axios, { AxiosResponse, AxiosError } from 'axios';
import { FavoriteProduct } from '../types/favorites';
// Assuming ProductId is string, consistent with FavoriteProduct.guitarId and Guitar._id
// No specific Product type needed for request payloads here, only IDs.

const API_BASE_URL = 'http://localhost:8080/favorites'; // Base URL for favorites

// Helper to get the token
const getToken = (): string | null => localStorage.getItem('access_token');

// General error handler for favorites API calls
const handleFavoritesApiError = (error: AxiosError, context: string): string => {
  console.error(`Error during ${context}:`, error);
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      if (status === 401) {
        return 'Ошибка авторизации. Пожалуйста, войдите снова.';
      }
      if (status === 404) {
        return `Ресурс не найден при ${context}.`;
      }
      return axiosError.response.data?.message || axiosError.response.data?.error || `Ошибка сервера (${status}) при ${context}.`;
    } else if (axiosError.request) {
      return `Ошибка сети при ${context}. Проверьте подключение.`;
    }
  }
  return `Неизвестная ошибка при ${context}.`;
};

/**
 * Fetches the current user's favorite products.
 * @returns Promise resolving to FavoriteProduct[].
 */
export const getFavorites = async (): Promise<FavoriteProduct[]> => {
  const token = getToken();
  if (!token) {
    throw new Error('Пользователь не авторизован.');
  }
  try {
    const response: AxiosResponse<FavoriteProduct[]> = await axios.get(API_BASE_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data || []; // Ensure an array is returned
  } catch (error) {
    throw new Error(handleFavoritesApiError(error as AxiosError, 'получении избранного'));
  }
};

/**
 * Adds a product to the user's favorites.
 * Note: The original FavoritesPage.tsx did not have a direct addFavorite call,
 * this is a standard function. The actual API might differ.
 * Assuming the API expects a productId in the body or path.
 * @param productId The ID of the product to add.
 * @returns Promise resolving to the added FavoriteProduct or void.
 */
export const addFavorite = async (productId: string): Promise<FavoriteProduct> => {
  // This is a presumptive implementation. The actual API endpoint and payload might differ.
  // The original code adds to basket, not favorites, from favorites page.
  // This function assumes a /favorites POST endpoint for adding.
  const token = getToken();
  if (!token) {
    throw new Error('Пользователь не авторизован.');
  }
  try {
    // Example: POST to /favorites with { guitarId: productId }
    // The response structure would also determine the Promise return type.
    // For now, let's assume it returns the newly created favorite item.
    const response: AxiosResponse<FavoriteProduct> = await axios.post(API_BASE_URL, 
      { guitarId: productId }, // Assuming this payload structure
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw new Error(handleFavoritesApiError(error as AxiosError, `добавлении товара ${productId} в избранное`));
  }
};

/**
 * Removes a product from the user's favorites.
 * @param productId The ID of the product to remove.
 * @returns Promise resolving to void.
 */
export const removeFavoriteItem = async (productId: string): Promise<void> => {
  const token = getToken();
  if (!token) {
    throw new Error('Пользователь не авторизован.');
  }
  try {
    // Original code uses POST with X-HTTP-Method-Override: 'DELETE'
    // and data: { guitarId: productId }
    await axios({
      method: 'POST', // Or 'DELETE' if API supports it directly
      url: `${API_BASE_URL}/delete`, // As per original code structure
      headers: {
        Authorization: `Bearer ${token}`,
        'X-HTTP-Method-Override': 'DELETE', // If backend expects this for DELETE via POST
      },
      data: { guitarId: productId },
    });
  } catch (error) {
    throw new Error(handleFavoritesApiError(error as AxiosError, `удалении товара ${productId} из избранного`));
  }
};

/**
 * Clears all products from the user's favorites.
 * @returns Promise resolving to void.
 */
export const clearAllFavorites = async (): Promise<void> => {
  const token = getToken();
  if (!token) {
    throw new Error('Пользователь не авторизован.');
  }
  try {
    // Original code uses PATCH to /favorites/delete with null body
    await axios.patch(`${API_BASE_URL}/delete`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    throw new Error(handleFavoritesApiError(error as AxiosError, 'очистке всего избранного'));
  }
};
