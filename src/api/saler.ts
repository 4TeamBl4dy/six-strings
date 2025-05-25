import instance from './instance';
import { Saler } from 'src/types';

export const getSalerProfile = () => instance.get<Saler>('/saler');
export const updateSalerProfile = (formData: FormData) => instance.put<Saler>('/saler', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
