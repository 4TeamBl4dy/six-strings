import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from '../../types/user';
import { AuthResponse, LoginCredentials, RegistrationData } from '../../types/auth';
import { login, register } from '../../api/auth'; // API functions

// Define a type for the payload of updateAuthUserDetails
// It should contain fields from UserProfile that can be updated
// and are relevant for the auth.user state (e.g., for display in headers)
export interface AuthUserUpdatePayload {
  name?: string;
  phone?: string;
  login?: string;
  img?: string; // User's avatar URL, if it's part of UserProfile and auth.user
}


// Helper function to get initial token from localStorage
const getInitialToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

// Helper function to get initial user data from localStorage
const getInitialUser = (): UserProfile | null => {
  if (typeof window !== 'undefined') {
    const token = getInitialToken();
    if (!token) return null;

    const userName = localStorage.getItem('userName');
    const userPhone = localStorage.getItem('userPhone');
    const userLogin = localStorage.getItem('login');
    const userImg = localStorage.getItem('userImg'); // Assuming img might be stored

    if (userName && userPhone && userLogin) {
      return { 
        login: userLogin, 
        name: userName, 
        phone: userPhone,
        img: userImg || undefined, // Handle if img is not stored
      };
    }
  }
  return null;
};


interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: getInitialUser(),
  token: getInitialToken(),
  isAuthenticated: !!getInitialToken(),
  isLoading: false,
  error: null,
};

// Async Thunks
export const loginUser = createAsyncThunk<
  AuthResponse, 
  { credentials: LoginCredentials; isSaler: boolean },
  { rejectValue: string }
>(
  'auth/loginUser',
  async ({ credentials, isSaler }, { rejectWithValue }) => {
    try {
      const response = await login(credentials, isSaler);
      localStorage.setItem('access_token', response.token);
      localStorage.setItem('userName', response.name);
      localStorage.setItem('userPhone', response.phone);
      localStorage.setItem('login', credentials.login);
      // Note: user 'img' is not typically returned by login/register, fetched later by profile pages.
      // If it were, we could store it here too.
      return response; 
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const registerUser = createAsyncThunk<
  AuthResponse,
  { userData: RegistrationData; isSaler: boolean },
  { rejectValue: string }
>(
  'auth/registerUser',
  async ({ userData, isSaler }, { rejectWithValue }) => {
    try {
      const response = await register(userData, isSaler);
      localStorage.setItem('access_token', response.token);
      localStorage.setItem('userName', response.name);
      localStorage.setItem('userPhone', response.phone);
      localStorage.setItem('login', userData.login);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('userName');
        localStorage.removeItem('userPhone');
        localStorage.removeItem('login');
        localStorage.removeItem('userImg'); // Clear img if stored
      }
    },
    setAuthError: (state, action: PayloadAction<string>) => {
        state.error = action.payload;
    },
    clearAuthError: (state) => {
        state.error = null;
    },
    // New synchronous action to update user details in auth state and localStorage
    updateAuthUserDetails: (state, action: PayloadAction<AuthUserUpdatePayload>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      } else if (action.payload.login) { 
        // If user was null but we get enough info (at least login), create it
        state.user = {
            login: action.payload.login,
            name: action.payload.name || '', // Provide defaults if not all fields are in payload
            phone: action.payload.phone || '',
            img: action.payload.img || undefined,
        };
      }
      // Update localStorage
      if (action.payload.name) localStorage.setItem('userName', action.payload.name);
      if (action.payload.phone) localStorage.setItem('userPhone', action.payload.phone);
      if (action.payload.login) localStorage.setItem('login', action.payload.login);
      if (action.payload.img) localStorage.setItem('userImg', action.payload.img);
      else if (action.payload.img === null) localStorage.removeItem('userImg'); // Handle explicit null to remove img
    }
  },
  extraReducers: (builder) => {
    builder
      // Login User
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        const login = action.meta.arg.credentials.login;
        state.user = { 
            login: login, 
            name: action.payload.name, 
            phone: action.payload.phone,
            // img is typically not part of AuthResponse, will be fetched by profile page
        };
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload || 'Login failed';
      })
      // Register User
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        const login = action.meta.arg.userData.login;
        state.user = { 
            login: login,
            name: action.payload.name, 
            phone: action.payload.phone 
        };
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload || 'Registration failed';
      });
  },
});

export const { logoutUser, setAuthError, clearAuthError, updateAuthUserDetails } = authSlice.actions;
export default authSlice.reducer;
