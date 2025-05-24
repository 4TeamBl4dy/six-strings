import axios, { AxiosResponse, AxiosError } from 'axios';
import { Guitar } from '../types/product';
import { getGuitars } from './products'; // To fetch all and then filter for getMyProducts

const API_BASE_URL = 'http://localhost:8080/guitars'; // Base URL for guitars

// Helper to get the token (though not explicitly used for product CRUD in original MyProductPage,
// it's good practice if endpoints become protected)
const getToken = (): string | null => localStorage.getItem('access_token');

// General error handler
const handleMyProductsApiError = (error: AxiosError, context: string): string => {
  console.error(`Error during ${context}:`, error);
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      // Add specific status handling if needed, e.g., 401, 403, 404
      return axiosError.response.data?.message || axiosError.response.data?.error || `Ошибка сервера (${status}) при ${context}.`;
    } else if (axiosError.request) {
      return `Ошибка сети при ${context}. Проверьте подключение.`;
    }
  }
  return `Неизвестная ошибка при ${context}.`;
};

/**
 * Fetches products for a specific seller by filtering all guitars.
 * @param sellerLogin The login of the seller whose products to fetch.
 * @returns Promise resolving to Guitar[].
 */
export const getMyProducts = async (sellerLogin: string): Promise<Guitar[]> => {
  try {
    const allGuitars = await getGuitars(); // Uses the existing function from products API
    return allGuitars.filter(guitar => guitar.seller?.login === sellerLogin);
  } catch (error) {
    // getGuitars already throws a formatted error. Re-throw or customize if needed.
    throw new Error(`Не удалось получить товары продавца: ${(error as Error).message}`);
  }
};

/**
 * Creates a new product for the current seller.
 * FormData should include all product details and seller information like sellerLogin, userName, userPhone.
 * @param productData FormData containing the product details.
 * @returns Promise resolving to the created Guitar.
 */
export const createMyProduct = async (productData: FormData): Promise<Guitar> => {
  // Note: Original code doesn't seem to use Authorization token for this POST
  try {
    const response: AxiosResponse<Guitar> = await axios.post(API_BASE_URL, productData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw new Error(handleMyProductsApiError(error as AxiosError, 'создании товара'));
  }
};

/**
 * Updates an existing product for the current seller.
 * @param productId The ID of the product to update.
 * @param productData FormData containing the updated product details.
 * @returns Promise resolving to the updated Guitar.
 */
export const updateMyProduct = async (productId: string, productData: FormData): Promise<Guitar> => {
  // Note: Original code doesn't seem to use Authorization token for this PUT
  try {
    const response: AxiosResponse<Guitar> = await axios.put(`${API_BASE_URL}/${productId}`, productData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw new Error(handleMyProductsApiError(error as AxiosError, `обновлении товара ${productId}`));
  }
};

/**
 * Deletes a product for the current seller.
 * @param productId The ID of the product to delete.
 * @returns Promise resolving to void.
 */
export const deleteMyProduct = async (productId: string): Promise<void> => {
  // Note: Original code doesn't seem to use Authorization token for this DELETE
  try {
    await axios.delete(`${API_BASE_URL}/${productId}`);
  } catch (error) {
    throw new Error(handleMyProductsApiError(error as AxiosError, `удалении товара ${productId}`));
  }
};
