export interface User {
  login: string;
  phone: string;
  name?: string;
  img?: string;
  password?: string;
}

export interface Saler {
  login: string;
  phone: string;
  name?: string;
  img?: string;
  password?: string;
}

export interface LoginProps {
  handleSetIsAuth: (token: string) => void;
}

export interface LoginResponse {
  token: string;
  name: string;
  phone: string;
}

export interface SignUpProps {
  handleSetIsAuth: (token: string) => void;
}

export interface RegisterResponse {
  token: string;
  name: string;
  phone: string;
}

export interface SidebarFooterProfileProps {
  user: User | null;
  onLogout: () => void;
  refreshUser: () => void;
}

export interface SidebarFooterSalerProps {
  user: Saler | null;
  onLogout: () => void;
  refreshUser: () => void;
}