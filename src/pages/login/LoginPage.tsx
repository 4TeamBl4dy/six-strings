import './styles.css';
import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { setToken, fetchToken } from 'src/hooks'; 
import Logo from '/public/icons/logo.png';
import { Box, Typography, InputAdornment } from '@mui/material';
import { ROUTES } from 'src/constants';
import { StyledCheckbox } from 'src/components/styledComponents';
import { Field } from 'src/components';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { LoginProps, LoginResponse } from 'src/types';

export const Login = ({ handleSetIsAuth }: LoginProps) => {
  const [account, setAccount] = useState<boolean>(false);
  const [login, setLogin] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [admin, setAdmin] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<boolean>(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState<string>('');
  const [passwordError, setPasswordError] = useState<boolean>(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState<string>('');

  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let isValid = true;

    if (!login) {
      setLoginError(true);
      setLoginErrorMessage('Поле с логином не должно быть пустым.');
      isValid = false;
    } else {
      setLoginError(false);
      setLoginErrorMessage('');
    }

    if (!password) {
      setPasswordError(true);
      setPasswordErrorMessage('Поле с паролем не должно быть пустым.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    if (!isValid) return;

    try {
      const response: AxiosResponse<LoginResponse> = await axios.post(
        admin ? 'http://localhost:8080/login_saler' : 'http://localhost:8080/login_user',
        { login: login, password }
      );
      const { token, name, phone } = response.data;

      setToken(token);
      localStorage.setItem('userName', name);
      localStorage.setItem('userPhone', phone);
      localStorage.setItem('login', login);

      handleSetIsAuth(token);
      setName(name);
      setPhone(phone);
      setAccount(true);
      navigate(admin ? ROUTES.SALER_PAGE : ROUTES.HOME_PAGE);
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(axiosError);
      if (axiosError.response) {
        if (axiosError.response.status === 401) {
          setLoginError(true);
          setLoginErrorMessage('Пользователь с таким логином не найден');
        } else if (axiosError.response.status === 402) {
          setPasswordError(true);
          setPasswordErrorMessage('Неверный пароль');
        } else {
          setLoginError(true);
          setLoginErrorMessage('Произошла ошибка. Пожалуйста, попробуйте снова.');
          setPasswordError(true);
          setPasswordErrorMessage('Произошла ошибка. Пожалуйста, попробуйте снова.');
        }
      } else {
        setLoginError(true);
        setLoginErrorMessage('Произошла ошибка сети. Проверьте подключение.');
        setPasswordError(true);
        setPasswordErrorMessage('Произошла ошибка сети. Проверьте подключение.');
      }
    }
  };

  const handleSetAdmin = () => {
    setAdmin((prev) => !prev);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const auth = fetchToken();

  useEffect(() => {
    if (auth) {
      navigate(admin ? ROUTES.MY_PRODUCTS : ROUTES.HOME_PAGE);
    }
  }, [auth, navigate]);

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
                onChange={(value: string) => setLogin(value)}
                error={loginError}
                helperText={loginErrorMessage}
              />
            </div>
            <div className="input-container">
              <Field
                sx={{ minWidth: '272px' }}
                placeholder="Пароль"
                value={password}
                onChange={(value: string) => setPassword(value)}
                type={showPassword ? 'text' : 'password'}
                error={passwordError}
                helperText={passwordErrorMessage}
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