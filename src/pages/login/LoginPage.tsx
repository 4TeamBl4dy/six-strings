import './LoginPage.css';
import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { setToken, fetchToken } from '../../hooks'; 
import Logo from '../../../public/logo.png';
import { Box } from '@mui/material';
import { ROUTES, isStrongPassword } from '../../constants';

// Тип для пропсов компонента
interface LoginProps {
  handleSetIsAuth: (token: string) => void;
}

// Тип для данных ответа от сервера
interface LoginResponse {
  token: string;
  name: string;
  phone: string;
}

export default function Login({ handleSetIsAuth }: LoginProps) {
  const [account, setAccount] = useState<boolean>(false);
  const [loginMis, setLoginMis] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [admin, setAdmin] = useState<boolean>(false);

  const navigate = useNavigate();

  const LoginBtn = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Базовые проверки
    if (email === '' && password === '') {
      setLoginMis('Поля с электронной почтой и паролем не должны быть пустыми.');
      return;
    }
    if (email === '') {
      setLoginMis('Поле с электронной почтой не должно быть пустым.');
      return;
    }
    if (password === '') {
      setLoginMis('Поле с паролем не должно быть пустым.');
      return;
    }

    // Если все проверки пройдены, отправляем запрос
    try {
      const response: AxiosResponse<LoginResponse> = await axios.post(
        admin ? 'http://localhost:8080/login_admin' : 'http://localhost:8080/login_user',
        { email, password }
      );
      const { token, name, phone } = response.data;

      setToken(token);
      localStorage.setItem('userName', name);
      localStorage.setItem('userPhone', phone);

      handleSetIsAuth(token);
      setName(name);
      setPhone(phone);
      setAccount(true);
      navigate(admin ? '/админ' : '/главная');
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(axiosError);
      if (axiosError.response) {
        if (axiosError.response.status === 401) {
          setLoginMis('Пользователь с такой почтой не найден');
        } else if (axiosError.response.status === 402) {
          setLoginMis('Неверный пароль');
        } else {
          setLoginMis('Произошла ошибка. Пожалуйста, попробуйте снова.');
        }
      } else {
        setLoginMis('Произошла ошибка сети. Проверьте подключение.');
      }
    }
  };

  const handleSetAdmin = () => {
    setAdmin((prev) => !prev);
  };

  const auth = fetchToken();

  useEffect(() => {
    if (auth) {
      navigate(ROUTES.HOME_PAGE);
    }
  }, [auth, navigate]);

  return (
    <div className="Login">
      <div className="login-form">
        <img src={Logo} />
        <Box sx={{ mx: '70px' }}>
          <h1>ВХОД</h1>
          <input
            className="login-input"
            placeholder="Email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          />
          <input
            className="login-input"
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          />
          <nav className="mistake">{loginMis}</nav>
          <label>
            <input type="checkbox" checked={admin} onChange={handleSetAdmin} />
            Войти как администратор
          </label>
          <button onClick={LoginBtn}>Войти</button>
          <NavLink to="/регистрация">
            <a>Зарегистрироваться</a>
          </NavLink>
        </Box>
      </div>
    </div>
  );
}