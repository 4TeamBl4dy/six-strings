import instance from './instance';
import { Guitar } from 'src/types'; // Assuming Guitar type is available

export const getAllGuitars = () => instance.get<Guitar[]>('/guitars');
export const getSellerGuitars = (sellerLogin: string) => instance.get<Guitar[]>(`/guitars?sellerLogin=${sellerLogin}`); // Adjust if endpoint is different
export const createGuitar = (formData: FormData) => instance.post<Guitar>('/guitars', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateGuitar = (guitarId: string, formData: FormData) => instance.put<Guitar>(`/guitars/${guitarId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteGuitar = (guitarId: string) => instance.delete(`/guitars/${guitarId}`);
