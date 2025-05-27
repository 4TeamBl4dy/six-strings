import './styles.css';
import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import axios, { AxiosResponse, AxiosError } from 'axios';
import Logo from '/public/icons/logo.png';
import { Box, Typography, InputAdornment } from '@mui/material';
import { PHONE_MASK, ROUTES } from 'src/constants';
import { StyledCheckbox } from 'src/components/styledComponents';
import { Field } from 'src/components';
import { isValidPhone, isStrongPassword } from 'src/constants';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { RegisterResponse, SignUpProps } from 'src/types';
import apiClient from 'src/api';

export default function Registration({ handleSetIsAuth }: SignUpProps) {
    const [account, setAccount] = useState<boolean>(false);
    const [name, setName] = useState<string>('');
    const [login, setLogin] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [saler, setSaler] = useState<boolean>(false);
    const [nameError, setNameError] = useState<boolean>(false);
    const [nameErrorMessage, setNameErrorMessage] = useState<string>('');
    const [loginError, setLoginError] = useState<boolean>(false);
    const [loginErrorMessage, setLoginErrorMessage] = useState<string>('');
    const [phoneError, setPhoneError] = useState<boolean>(false);
    const [phoneErrorMessage, setPhoneErrorMessage] = useState<string>('');
    const [passwordError, setPasswordError] = useState<boolean>(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState<string>('');
    const [confirmPasswordError, setConfirmPasswordError] = useState<boolean>(false);
    const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

    const navigate = useNavigate();

    const register = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        let isValid = true;

        if (!name) {
            setNameError(true);
            setNameErrorMessage('Поле с именем не должно быть пустым.');
            isValid = false;
        } else {
            setNameError(false);
            setNameErrorMessage('');
        }

        if (!login) {
            setLoginError(true);
            setLoginErrorMessage('Поле с логином не должно быть пустым.');
            isValid = false;
        } else {
            setLoginError(false);
            setLoginErrorMessage('');
        }

        if (!phone) {
            setPhoneError(true);
            setPhoneErrorMessage('Поле с телефоном не должно быть пустым.');
            isValid = false;
        } else if (!isValidPhone(phone)) {
            setPhoneError(true);
            setPhoneErrorMessage('Неверный формат телефона.');
            isValid = false;
        } else {
            setPhoneError(false);
            setPhoneErrorMessage('');
        }

        if (!password) {
            setPasswordError(true);
            setPasswordErrorMessage('Поле с паролем не должно быть пустым.');
            isValid = false;
        } else if (!isStrongPassword(password)) {
            setPasswordError(true);
            setPasswordErrorMessage(
                'Пароль должен содержать минимум 8 символов, включая 1 заглавную букву, 1 строчную, 1 цифру и 1 спецсимвол.'
            );
            isValid = false;
        } else {
            setPasswordError(false);
            setPasswordErrorMessage('');
        }

        if (!confirmPassword) {
            setConfirmPasswordError(true);
            setConfirmPasswordErrorMessage('Поле для подтверждения пароля не должно быть пустым.');
            isValid = false;
        } else if (confirmPassword !== password) {
            setConfirmPasswordError(true);
            setConfirmPasswordErrorMessage('Пароли не совпадают.');
            isValid = false;
        } else {
            setConfirmPasswordError(false);
            setConfirmPasswordErrorMessage('');
        }

        if (!isValid) return;

        try {
            const userData = {
                login,
                password,
                name,
                phone,
            };

            const response: AxiosResponse<RegisterResponse> = await apiClient.post(
                saler ? '/register_saler' : '/register_user',
                userData
            );

            const { token, name: responseName, phone: responsePhone } = response.data;
            console.log('Ответ сервера:', response.data); // Для отладки

            localStorage.setItem('token', token);
            localStorage.setItem('login', login);
            localStorage.setItem('userName', responseName);
            localStorage.setItem('userPhone', responsePhone);
            handleSetIsAuth(token);
            setAccount(true);

            const redirectPath = saler ? ROUTES.MY_PRODUCTS : ROUTES.HOME_PAGE;
            console.log('Перенаправление на:', redirectPath); // Для отладки
            navigate(redirectPath);
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error('Ошибка при регистрации:', axiosError);
            if (axiosError.response?.status === 401) {
                setLoginError(true);
                setLoginErrorMessage('Пользователь с таким логином уже зарегистрирован.');
            } else {
                setLoginError(true);
                setLoginErrorMessage('Произошла ошибка. Пожалуйста, попробуйте снова.');
            }
        }
    };

    const handleSetSaler = (e: ChangeEvent<HTMLInputElement>) => {
        setSaler(e.target.checked);
        console.log('Флаг продавца:', e.target.checked);
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword((prev) => !prev);
    };

    return (
        <div className="Login">
            <div className="login-form">
                <img src={Logo} className="logo" alt="Logo" />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3>РЕГИСТРАЦИЯ</h3>
                    <form
                        onSubmit={register}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                        <div className="input-container">
                            <Field
                                sx={{ minWidth: '272px' }}
                                placeholder="Имя"
                                value={name}
                                onChange={(value: string) => setName(value)}
                                error={nameError}
                                helperText={nameErrorMessage}
                            />
                        </div>
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
                                placeholder="Телефон"
                                value={phone}
                                onChange={(value: string) => setPhone(value)}
                                mask={PHONE_MASK}
                                error={phoneError}
                                helperText={phoneErrorMessage}
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
                                                {showPassword ? (
                                                    <VisibilityOffIcon sx={{ fontSize: '18px', mt: 1 }} />
                                                ) : (
                                                    <VisibilityIcon sx={{ fontSize: '18px', mt: 1 }} />
                                                )}
                                            </span>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </div>
                        <div className="input-container">
                            <Field
                                sx={{ minWidth: '272px' }}
                                placeholder="Повторите пароль"
                                value={confirmPassword}
                                onChange={(value: string) => setConfirmPassword(value)}
                                type={showConfirmPassword ? 'text' : 'password'}
                                error={confirmPasswordError}
                                helperText={confirmPasswordErrorMessage}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <span className="eye-icon" onClick={toggleConfirmPasswordVisibility}>
                                                {showConfirmPassword ? (
                                                    <VisibilityOffIcon sx={{ fontSize: '18px', mt: 1 }} />
                                                ) : (
                                                    <VisibilityIcon sx={{ fontSize: '18px', mt: 1 }} />
                                                )}
                                            </span>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </div>
                        <Typography>
                            <StyledCheckbox checked={saler} onChange={handleSetSaler} />
                            Зарегистрироваться как продавец
                        </Typography>
                        <button type="submit">Зарегистрироваться</button>
                        <NavLink to={ROUTES.LOGIN}>
                            <a>Войти</a>
                        </NavLink>
                    </form>
                </Box>
            </div>
        </div>
    );
}
