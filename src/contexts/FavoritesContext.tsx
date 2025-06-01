import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';
import apiClient from 'src/api';
import { FavoriteItem, Guitar } from 'src/types'; // Assuming Guitar type is needed
import { useToast } from 'src/components'; // Assuming useToast is in src/components

interface FavoritesContextType {
    favoriteItems: FavoriteItem[];
    loading: boolean;
    error: string | null;
    fetchFavorites: () => Promise<void>;
    addToFavorites: (guitar: Guitar) => Promise<void>;
    removeFromFavorites: (guitarId: string) => Promise<void>;
    clearFavorites: () => Promise<void>;
    isItemInFavorites: (guitarId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
    const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();

    const fetchFavorites = useCallback(async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('access_token');
        if (!token) {
            setError('User not authenticated');
            setLoading(false);
            setFavoriteItems([]); // Clear items if not authenticated
            return;
        }
        try {
            const response = await apiClient.get<FavoriteItem[]>('/favorites', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFavoriteItems(response.data || []);
        } catch (err) {
            console.error('Error fetching favorites:', err);
            setError('Failed to fetch favorites');
            showToast('Ошибка при загрузке избранного', 'error');
            setFavoriteItems([]); // Clear items on error
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    const addToFavorites = async (guitar: Guitar) => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            showToast('Пожалуйста, войдите в систему, чтобы добавить товар в избранное', 'info');
            return;
        }
        if (favoriteItems.some(item => item.guitarId === guitar._id)) {
            showToast('Этот товар уже есть в вашем избранном', 'info');
            return;
        }
        try {
            await apiClient.post('/favorites', {
                guitarId: guitar._id,
                guitarImg: guitar.img,
                guitarName: guitar.name,
                guitarAmount: guitar.amount,
                guitarCost: guitar.cost,
            }, { headers: { Authorization: `Bearer ${token}` } });
            showToast('Товар успешно добавлен в избранное', 'success');
            await fetchFavorites(); // Refetch favorites
        } catch (err) {
            console.error('Error adding to favorites:', err);
            showToast('Ошибка при добавлении товара в избранное', 'error');
        }
    };

    const removeFromFavorites = async (guitarId: string) => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            showToast('Пожалуйста, войдите в систему.', 'info');
            return;
        }

        const originalFavorites = [...favoriteItems];
        setFavoriteItems(prevItems => prevItems.filter(item => item.guitarId !== guitarId));

        try {
            await apiClient({
                method: 'POST', // Or DELETE if your backend supports it directly
                url: '/favorites/delete',
                headers: { Authorization: `Bearer ${token}`, 'X-HTTP-Method-Override': 'DELETE' },
                data: { guitarId },
            });
            showToast('Товар удален из избранного', 'success');
            // Optimistic update is already done. No need to fetchFavorites.
        } catch (err) {
            console.error('Error removing item from favorites:', err);
            setFavoriteItems(originalFavorites); // Revert to original state
            showToast('Ошибка при удалении товара из избранного', 'error');
        }
    };

    const clearFavorites = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        try {
            await apiClient.patch('/favorites/deleteAll', null, { headers: { Authorization: `Bearer ${token}` } });
            showToast('Избранное очищено', 'success');
            await fetchFavorites(); // Refetch
        } catch (err) {
            showToast('Ошибка при очистке избранного', 'error');
        }
    };

    const isItemInFavorites = (guitarId: string) => {
        return favoriteItems.some(item => item.guitarId === guitarId);
    };

    return (
        <FavoritesContext.Provider value={{ favoriteItems, loading, error, fetchFavorites, addToFavorites, removeFromFavorites, clearFavorites, isItemInFavorites }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};
