import instance from './instance';
import { User } from 'src/types'; 

export const getUserProfile = () => instance.get<User>('/user');
export const updateUserProfile = (formData: FormData) => instance.put<User>('/user', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
