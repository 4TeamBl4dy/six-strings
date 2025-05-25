import instance from './instance';
import { FavoriteItem, Guitar } from 'src/types'; // Assuming types are available

export const getFavorites = () => instance.get<FavoriteItem[]>('/favorites');
// Note: Adding to basket from favorites page likely uses `addToBasket` from `basket.ts`
export const addFavorite = (data: { guitarId: string; guitarImg: string; guitarName: string; guitarCost: number; guitarAmount: number; }) => instance.post('/favorites', data);
export const removeFavoriteItem = (guitarId: string) => instance.post('/favorites/delete', { guitarId }, { headers: { 'X-HTTP-Method-Override': 'DELETE' } });
export const clearFavorites = () => instance.patch('/favorites/delete');
