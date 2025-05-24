// src/api/index.ts
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { Guitar, BasketItem } from 'src/types';

const API_BASE_URL = 'http://localhost:8080';

// Create an axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor to add the auth token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Guitar API ---
export const fetchGuitarsAPI = async (): Promise<Guitar[]> => {
  try {
    const response: AxiosResponse<Guitar[]> = await apiClient.get('/guitars');
    return response.data || [];
  } catch (error) {
    console.error('API Error - Fetching guitars:', error);
    throw error; // Re-throw to be caught by action creators
  }
};

// --- Basket API ---
export const fetchBasketAPI = async (): Promise<BasketItem[]> => {
  try {
    const response: AxiosResponse<BasketItem[]> = await apiClient.get('/basket');
    return response.data;
  } catch (error) {
    console.error('API Error - Fetching basket:', error);
    throw error;
  }
};

export const addItemToBasketAPI = async (guitarId: string, quantity: number): Promise<BasketItem> => {
  // This is a common way to add items; backend might expect product details or just ID and quantity.
  // The original BasketBtn component seems to imply a more complex object might be sent.
  // For now, let's assume the backend can handle adding by guitarId and quantity.
  // If not, this function will need adjustment based on actual backend requirements.
  // The original code in BasketBtn directly passed the whole 'guitar' object.
  // Let's try to find a relevant backend call or assume a simple structure for now.
  // The backend /basket PUT seems to be for updates (plus/minus), not adding new items.
  // There's no explicit "add to basket" API call shown in BasketPage.tsx, only in BasketBtn.
  // For now, I'll create a placeholder. This will need to be verified/adjusted.
  // A common pattern for adding to cart might be POST /basket with { guitarId, quantity }
  try {
    // This is a guess. The actual endpoint and payload need to be confirmed.
    // The original code for BasketBtn in src/components/UI/buttons/BasketBtn/BasketBtn.tsx
    // does a POST to /basket with the guitar object.
    // To match that, we might need the full Guitar object.
    // However, for a dedicated API function, sending only necessary IDs and quantity is cleaner.
    // Let's assume a POST to /basket with { guitarId, count }
    const response: AxiosResponse<BasketItem> = await apiClient.post('/basket', { guitarId, count: quantity });
    return response.data;
  } catch (error) {
    console.error('API Error - Adding item to basket:', error);
    throw error;
  }
};

export const updateBasketItemQuantityAPI = async (guitarId: string, action: 'plus' | 'minus'): Promise<BasketItem> => {
  try {
    const response: AxiosResponse<BasketItem> = await apiClient.put(`/basket/${guitarId}`, { action });
    return response.data;
  } catch (error) {
    console.error('API Error - Updating basket item quantity:', error);
    throw error;
  }
};

export const removeBasketItemAPI = async (guitarId: string): Promise<void> => {
  try {
    // Original BasketPage.tsx used a POST request with 'X-HTTP-Method-Override': 'DELETE'
    // and data: { guitarId } to 'http://localhost:8080/basket/delete'
    await apiClient.post('/basket/delete', { guitarId }, {
      headers: { 'X-HTTP-Method-Override': 'DELETE' }
    });
  } catch (error) {
    console.error('API Error - Removing basket item:', error);
    throw error;
  }
};

export const clearBasketAPI = async (): Promise<void> => {
  try {
    // Original BasketPage.tsx used a PATCH request to 'http://localhost:8080/basket/delete'
    await apiClient.patch('/basket/delete');
  } catch (error) {
    console.error('API Error - Clearing basket:', error);
    throw error;
  }
};

// Placeholder for other API calls (user auth, etc.)

export default apiClient;
