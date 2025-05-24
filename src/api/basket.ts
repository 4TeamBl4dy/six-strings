import axios, { AxiosError, AxiosResponse } from 'axios';
import { BasketItem, AddToBasketPayload } from '../types/basket';

const API_BASE_URL = 'http://localhost:8080/basket';

const getToken = () => localStorage.getItem('access_token');

const handleApiError = (error: AxiosError, defaultMessage: string): string => {
  if (error.response) {
    if (error.response.status === 401) {
      return 'Невалидный токен. Пожалуйста, войдите снова.';
    }
    if (error.response.status === 404) {
      return 'Ресурс не найден.';
    }
    // Handle specific error for item already in basket (e.g., 409 Conflict)
    if (error.response.status === 409) {
        return (error.response.data as { message?: string })?.message || 'Товар уже есть в корзине.';
    }
    return (error.response.data as { message?: string })?.message || defaultMessage;
  } else if (error.request) {
    return 'Нет ответа от сервера. Проверьте ваше интернет-соединение.';
  } else {
    return error.message || defaultMessage;
  }
};

export const getBasket = async (): Promise<BasketItem[]> => {
  const token = getToken();
  if (!token) {
    throw new Error('Пожалуйста, войдите в систему.');
  }
  try {
    const response = await axios.get<BasketItem[]>(API_BASE_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (err) {
    const axiosError = err as AxiosError;
    throw new Error(handleApiError(axiosError, 'Произошла ошибка при загрузке корзины.'));
  }
};

/**
 * Adds an item to the basket.
 * @param itemData Data of the item to add.
 * @returns Promise resolving to the updated BasketItem[] array.
 */
export const addItemToBasket = async (itemData: AddToBasketPayload): Promise<BasketItem[]> => {
  const token = getToken();
  if (!token) {
    throw new Error('Пожалуйста, войдите в систему.');
  }
  try {
    // The original FavoritesPage.tsx implies the response directly contains the new basket or item
    // For consistency with other basket update functions, let's assume it returns the full updated basket.
    // If it returns only the added item, the component logic would need to merge.
    // If it returns nothing (204 No Content), then getBasket() would need to be called separately.
    const response: AxiosResponse<BasketItem[]> = await axios.post(API_BASE_URL, itemData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; 
  } catch (err) {
    const axiosError = err as AxiosError;
    throw new Error(handleApiError(axiosError, 'Ошибка при добавлении товара в корзину.'));
  }
};


export const updateBasketItemQuantity = async (guitarId: string, action: 'plus' | 'minus'): Promise<BasketItem[]> => {
  const token = getToken();
  if (!token) {
    throw new Error('Пожалуйста, войдите в систему.');
  }
  try {
    const response = await axios.put<BasketItem[]>(`${API_BASE_URL}/${guitarId}`, { action }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (err) {
    const axiosError = err as AxiosError;
    throw new Error(handleApiError(axiosError, `Ошибка при ${action === 'plus' ? 'увеличении' : 'уменьшении'} количества товара.`));
  }
};

export const removeBasketItem = async (guitarId: string): Promise<void> => {
  const token = getToken();
  if (!token) {
    throw new Error('Пожалуйста, войдите в систему.');
  }
  try {
    await axios({
      method: 'POST',
      url: `${API_BASE_URL}/delete`,
      headers: {
        Authorization: `Bearer ${token}`,
        'X-HTTP-Method-Override': 'DELETE',
      },
      data: { guitarId },
    });
    // Consider returning updated basket here as well for consistency if desired by components
  } catch (err) {
    const axiosError = err as AxiosError;
    throw new Error(handleApiError(axiosError, 'Ошибка при удалении товара из корзины.'));
  }
};

export const clearBasket = async (): Promise<void> => {
  const token = getToken();
  if (!token) {
    throw new Error('Пожалуйста, войдите в систему.');
  }
  try {
    await axios.patch(`${API_BASE_URL}/delete`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Consider returning empty basket [] for consistency
  } catch (err) {
    const axiosError = err as AxiosError;
    throw new Error(handleApiError(axiosError, 'Ошибка при удалении всех товаров из корзины.'));
  }
};

export const confirmPurchase = async (): Promise<void> => {
  const token = getToken();
  if (!token) {
    throw new Error('Пожалуйста, войдите в систему.');
  }
  try {
    await axios.post(`${API_BASE_URL}/confirm`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
     // Consider returning empty basket [] for consistency
  } catch (err) {
    const axiosError = err as AxiosError;
    throw new Error(handleApiError(axiosError, 'Ошибка при подтверждении покупки'));
  }
};
