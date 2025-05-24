import './styles.css';
import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; // Import Redux hooks
// Removed setToken, fetchToken from src/hooks as Redux handles token
import Logo from '/public/icons/logo.png';
import { Box, Typography, InputAdornment } from '@mui/material';
import { ROUTES } from 'src/constants';
import { StyledCheckbox } from 'src/components/styledComponents';
import { Field } from 'src/components';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
// AuthHandlerProps is removed as Redux manages auth state globally
// import { AuthHandlerProps } from '../../types/auth'; 
import { LoginCredentials } from '../../types/auth';
import { AppDispatch, RootState } from '../../storage/store';
import { loginUser, clearAuthError } from '../../storage/features/authSlice';

// handleSetIsAuth prop is removed
export const Login = () => { 
  const dispatch = useDispatch<AppDispatch>();
  const { 
    isLoading, 
    error: authError, 
    isAuthenticated 
  } = useSelector((state: RootState) => state.auth);
  
  const navigate = useNavigate();

  // Local state for form inputs
  const [login, setLogin] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [admin, setAdmin] = useState<boolean>(false); // For "login as saler" checkbox
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Local state for form validation errors (optional, for immediate feedback)
  const [localLoginError, setLocalLoginError] = useState<string>('');
  const [localPasswordError, setLocalPasswordError] = useState<string>('');

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(clearAuthError()); // Clear previous API errors
    setLocalLoginError(''); // Clear local validation errors
    setLocalPasswordError('');

    let isValid = true;
    if (!login) {
      setLocalLoginError('Поле с логином не должно быть пустым.');
      isValid = false;
    }
    if (!password) {
      setLocalPasswordError('Поле с паролем не должно быть пустым.');
      isValid = false;
    }

    if (!isValid) return;

    const credentials: LoginCredentials = { login, password };
    dispatch(loginUser({ credentials, isSaler: admin }))
      .unwrap()
      .then(() => {
        // Navigation will be handled by useEffect watching isAuthenticated
      })
      .catch((errorPayload) => {
        // Error is already in authError from Redux state, no need to set local error here
        // unless specific field highlighting is desired based on errorPayload content.
        // For now, a general authError display is sufficient.
        if (typeof errorPayload === 'string') {
            if (errorPayload.toLowerCase().includes('пароль')) {
                setLocalPasswordError(errorPayload);
            } else if (errorPayload.toLowerCase().includes('логин') || errorPayload.toLowerCase().includes('пользователь')) {
                setLocalLoginError(errorPayload);
            }
        }
      });
  };

  const handleSetAdmin = () => {
    setAdmin((prev) => !prev);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  
  useEffect(() => {
    if (isAuthenticated) {
      // User info is in state.auth.user if needed here
      // Saler role is determined by 'admin' state at login time.
      // The thunk stores necessary info in localStorage.
      navigate(admin ? ROUTES.SALER_PAGE : ROUTES.HOME_PAGE);
    }
  }, [isAuthenticated, navigate, admin]);

  // Clear auth error on component unmount
  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  // Determine overall error message to display
  const displayLoginError = localLoginError || (authError && (authError.toLowerCase().includes('логин') || authError.toLowerCase().includes('пользователь')) ? authError : '');
  const displayPasswordError = localPasswordError || (authError && authError.toLowerCase().includes('пароль') ? authError : '');
  const generalAuthError = authError && !displayLoginError && !displayPasswordError ? authError : null;


  return (
    <div className="Login">
      <div className="login-form">
        <img src={Logo} className="logo" />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3>ВХОД</h3>
          {generalAuthError && <Typography color="error" sx={{ mb: 1 }}>{generalAuthError}</Typography>}
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="input-container">
              <Field
                sx={{ minWidth: '272px' }}
                placeholder="Логин"
                value={login}
                onChange={(value: string) => { setLogin(value); setLocalLoginError(''); dispatch(clearAuthError()); }}
                error={!!displayLoginError}
                helperText={displayLoginError}
              />
            </div>
            <div className="input-container">
              <Field
                sx={{ minWidth: '272px' }}
                placeholder="Пароль"
                value={password}
                onChange={(value: string) => { setPassword(value); setLocalPasswordError(''); dispatch(clearAuthError()); }}
                type={showPassword ? 'text' : 'password'}
                error={!!displayPasswordError}
                helperText={displayPasswordError}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <span className="eye-icon" onClick={togglePasswordVisibility}>
                        {showPassword ? <VisibilityOffIcon sx={{ fontSize: '18px', mt: 1 }} /> : <VisibilityIcon sx={{ fontSize: '18px', mt: 1 }} />}
                      </span>
                    </InputAdornment>
                  ),
                }}
              />
            </div>
            <Typography>
              <StyledCheckbox checked={admin} onChange={handleSetAdmin} />Войти как продавец
            </Typography>
            <button type="submit">Войти</button>
            <NavLink to={ROUTES.REGISTRATION}>
              <a>Зарегистрироваться</a>
            </NavLink>
          </form>
        </Box>
      </div>
    </div>
  );
}