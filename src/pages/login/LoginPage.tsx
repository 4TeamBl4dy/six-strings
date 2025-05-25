import './styles.css';
import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'src/store/store';
import { loginUserThunk, loginSalerThunk } from 'src/store/authSlice';
// import { setToken, fetchToken } from 'src/hooks'; // fetchToken might be replaced by Redux state, setToken by thunk
import Logo from '/public/icons/logo.png';
// import { loginUser, loginSaler } from 'src/api'; // API calls are now in thunks
import { Box, Typography, InputAdornment } from '@mui/material';
import { ROUTES } from 'src/constants';
import { StyledCheckbox } from 'src/components/styledComponents';
import { Field } from 'src/components';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

// LoginProps is no longer needed as handleSetIsAuth will be removed
// interface LoginProps {
//   handleSetIsAuth: (token: string) => void;
// }

export const Login = (/*{ handleSetIsAuth }: LoginProps*/) => {
  const dispatch: AppDispatch = useDispatch();
  const { isLoading, error: authError, isAuthenticated, isSalerAccount } = useSelector((state: RootState) => state.auth);

  const [login, setLoginState] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [admin, setAdmin] = useState<boolean>(false); // For the checkbox "Войти как продавец"
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  // Local form validation errors
  const [loginValidationError, setLoginValidationError] = useState<string>('');
  const [passwordValidationError, setPasswordValidationError] = useState<string>('');

  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let isValid = true;
    setLoginValidationError('');
    setPasswordValidationError('');

    if (!login) {
      setLoginValidationError('Поле с логином не должно быть пустым.');
      isValid = false;
    }
    if (!password) {
      setPasswordValidationError('Поле с паролем не должно быть пустым.');
      isValid = false;
    }
    if (!isValid) return;

    if (admin) {
      dispatch(loginSalerThunk({ login, password }));
    } else {
      dispatch(loginUserThunk({ login, password }));
    }
  };
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate(isSalerAccount ? ROUTES.MY_PRODUCTS : ROUTES.HOME_PAGE);
    }
  }, [isAuthenticated, isSalerAccount, navigate]);

  const handleSetAdmin = () => {
    setAdmin((prev) => !prev);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="Login">
      <div className="login-form">
        <img src={Logo} className="logo" />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3>ВХОД</h3>
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="input-container">
              <Field
                sx={{ minWidth: '272px' }}
                placeholder="Логин"
                value={login}
                onChange={(value: string) => setLoginState(value)}
                error={!!loginValidationError || (!!authError && !passwordValidationError)} // Show authError on login field if not a password-specific error
                helperText={loginValidationError || (authError && !passwordValidationError ? authError : '')}
              />
            </div>
            <div className="input-container">
              <Field
                sx={{ minWidth: '272px' }}
                placeholder="Пароль"
                value={password}
                onChange={(value: string) => setPassword(value)}
                type={showPassword ? 'text' : 'password'}
                error={!!passwordValidationError || (!!authError && passwordValidationError === '')} // Show authError on password if it's password-specific or general
                helperText={passwordValidationError || (authError && passwordValidationError === '' ? authError : '')}
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
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
            <NavLink to={ROUTES.REGISTRATION}>
              <a>Зарегистрироваться</a>
            </NavLink>
          </form>
        </Box>
      </div>
    </div>
  );
}