import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';
import apiClient from 'src/api';
import { BasketItem, Guitar } from 'src/types'; // Assuming Guitar type is needed for add function
import { useToast } from 'src/components'; // Assuming useToast is in src/components

interface BasketContextType {
    basketItems: BasketItem[];
    loading: boolean;
    error: string | null;
    fetchBasket: () => Promise<void>;
    addToBasket: (guitar: Guitar) => Promise<void>;
    updateBasketItemCount: (guitarId: string, action: 'plus' | 'minus') => Promise<void>;
    removeFromBasket: (guitarId: string) => Promise<void>;
    clearBasket: () => Promise<void>;
    isItemInBasket: (guitarId: string) => boolean;
}

const BasketContext = createContext<BasketContextType | undefined>(undefined);

export const BasketProvider = ({ children }: { children: ReactNode }) => {
    const [basketItems, setBasketItems] = useState<BasketItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();

    const fetchBasket = useCallback(async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('access_token');
        if (!token) {
            setError('User not authenticated');
            setLoading(false);
            setBasketItems([]); // Clear items if not authenticated
            return;
        }
        try {
            const response = await apiClient.get<BasketItem[]>('/basket', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBasketItems(response.data || []);
        } catch (err) {
            console.error('Error fetching basket:', err);
            setError('Failed to fetch basket');
            showToast('Ошибка при загрузке корзины', 'error');
            setBasketItems([]); // Clear items on error
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchBasket();
    }, [fetchBasket]);

    const addToBasket = async (guitar: Guitar) => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            showToast('Пожалуйста, войдите в систему, чтобы добавить товар в корзину', 'info');
            return;
        }
        if (guitar.amount === 0) {
            showToast('Товара нет в наличии', 'info');
            return;
        }
        if (basketItems.some(item => item.guitarId === guitar._id)) {
            showToast('Этот товар уже есть в вашей корзине', 'info');
            return;
        }
        try {
            await apiClient.post('/basket', {
                guitarId: guitar._id,
                guitarImg: guitar.img,
                guitarName: guitar.name,
                guitarAmount: guitar.amount,
                guitarCost: guitar.cost,
            }, { headers: { Authorization: `Bearer ${token}` } });
            showToast('Товар успешно добавлен в корзину', 'success');
            await fetchBasket(); // Refetch basket to update state
        } catch (err) {
            console.error('Error adding to basket:', err);
            showToast('Ошибка при добавлении товара в корзину', 'error');
        }
    };

    const updateBasketItemCount = async (guitarId: string, action: 'plus' | 'minus') => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            showToast('Пожалуйста, войдите в систему.', 'info');
            return;
        }

        const originalBasket = [...basketItems];
        const itemIndex = basketItems.findIndex(item => item.guitarId === guitarId);

        if (itemIndex === -1) {
            console.error('Item not found in basket');
            showToast('Товар не найден в корзине.', 'error');
            return;
        }

        const item = basketItems[itemIndex];
        const newCount = action === 'plus' ? item.guitarCount + 1 : item.guitarCount - 1;

        if (newCount < 1) {
            // Optionally, could call removeFromBasket(guitarId) or confirm with user
            showToast('Количество не может быть меньше 1. Удалите товар, если это необходимо.', 'info');
            return;
        }
        if (newCount > item.guitarAmount) {
            showToast(`Максимальное количество товара: ${item.guitarAmount}`, 'info');
            return;
        }

        const updatedBasketItems = originalBasket.map(basketItem =>
            basketItem.guitarId === guitarId ? { ...basketItem, guitarCount: newCount } : basketItem
        );
        setBasketItems(updatedBasketItems);

        try {
            await apiClient.put(`/basket/${guitarId}`, { action }, { headers: { Authorization: `Bearer ${token}` } });
            // Optimistic update is already done. No need to fetchBasket here if API returns no content or just confirms.
            // If API returns the updated item or basket, you might want to use that response.
        } catch (err) {
            console.error('Error updating basket item count:', err);
            setBasketItems(originalBasket); // Revert to original state
            showToast('Ошибка при изменении количества товара', 'error');
        }
    };

    const removeFromBasket = async (guitarId: string) => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            showToast('Пожалуйста, войдите в систему.', 'info');
            return;
        }

        const originalBasket = [...basketItems];
        setBasketItems(prevItems => prevItems.filter(item => item.guitarId !== guitarId));

        try {
            await apiClient({
                method: 'POST', // Or DELETE if your backend supports it directly
                url: '/basket/delete',
                headers: { Authorization: `Bearer ${token}`, 'X-HTTP-Method-Override': 'DELETE' },
                data: { guitarId },
            });
            showToast('Товар удален из корзины', 'success');
            // Optimistic update is already done. No need to fetchBasket.
        } catch (err) {
            console.error('Error removing item from basket:', err);
            setBasketItems(originalBasket); // Revert to original state
            showToast('Ошибка при удалении товара из корзины', 'error');
        }
    };

    const clearBasket = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        try {
            await apiClient.patch('/basket/delete', null, { headers: { Authorization: `Bearer ${token}` } });
            showToast('Корзина очищена', 'success');
            await fetchBasket(); // Refetch
        } catch (err) {
            showToast('Ошибка при очистке корзины', 'error');
        }
    };

    const isItemInBasket = (guitarId: string) => {
        return basketItems.some(item => item.guitarId === guitarId);
    };

    return (
        <BasketContext.Provider value={{ basketItems, loading, error, fetchBasket, addToBasket, updateBasketItemCount, removeFromBasket, clearBasket, isItemInBasket }}>
            {children}
        </BasketContext.Provider>
    );
};

export const useBasket = () => {
    const context = useContext(BasketContext);
    if (context === undefined) {
        throw new Error('useBasket must be used within a BasketProvider');
    }
    return context;
};
