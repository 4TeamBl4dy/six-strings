import instance from './instance';
import { User, Saler } from 'src/types'; // Assuming types

interface LoginResponse {
  token: string;
  name: string;
  phone: string;
  login: string; // Assuming login is also returned
}

export const loginUser = (credentials: any) => instance.post<LoginResponse>('/login_user', credentials);
export const loginSaler = (credentials: any) => instance.post<LoginResponse>('/login_saler', credentials);
export const registerUser = (userData: any) => instance.post<LoginResponse>('/register_user', userData);
export const registerSaler = (userData: any) => instance.post<LoginResponse>('/register_saler', userData);
