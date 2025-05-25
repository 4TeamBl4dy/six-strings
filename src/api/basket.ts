import instance from './instance';
import { BasketItem, Guitar } from 'src/types'; // Assuming types are available

export const getBasket = () => instance.get<BasketItem[]>('/basket');
export const addToBasket = (data: { guitarId: string; guitarImg: string; guitarName: string; guitarCost: number; guitarAmount: number; }) => instance.post('/basket', data);
export const updateBasketItemQuantity = (guitarId: string, action: 'plus' | 'minus') => instance.put(`/basket/${guitarId}`, { action });
export const removeBasketItem = (guitarId: string) => instance.post('/basket/delete', { guitarId }, { headers: { 'X-HTTP-Method-Override': 'DELETE' } });
export const clearBasket = () => instance.patch('/basket/delete');
export const confirmPurchase = () => instance.post('/basket/confirm');
