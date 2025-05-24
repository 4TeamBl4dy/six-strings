// Props for components that handle authentication success (e.g., setting auth state)
export interface AuthHandlerProps {
  handleSetIsAuth: (token: string) => void;
}

// Response structure for login and registration endpoints
export interface AuthResponse {
  token: string;
  name: string; // User's name
  phone: string; // User's phone
  // Potentially add login field if common and useful for client post-login
}

// Credentials for login
export interface LoginCredentials {
  login: string;
  password; string;
}

// Data for registration
export interface RegistrationData {
  login: string;
  password; string;
  name: string;
  phone: string;
}
