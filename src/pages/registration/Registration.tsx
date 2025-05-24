import './styles.css';
import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react'; // Added useEffect
import { useNavigate, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; // Import Redux hooks
import Logo from '/public/icons/logo.png';
import { Box, Typography, InputAdornment } from '@mui/material';
import { PHONE_MASK, ROUTES } from 'src/constants';
import { StyledCheckbox } from 'src/components/styledComponents';
import { Field } from 'src/components';
import { isValidPhone, isStrongPassword } from 'src/constants';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
// AuthHandlerProps is removed as Redux manages auth state globally
import { RegistrationData } from '../../types/auth';
import { AppDispatch, RootState } from '../../storage/store';
import { registerUser, clearAuthError } from '../../storage/features/authSlice';

// handleSetIsAuth prop is removed
export default function Registration() {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    isLoading, 
    error: authError, 
    isAuthenticated 
  } = useSelector((state: RootState) => state.auth);

  const navigate = useNavigate();

  // Local state for form inputs remains
  const [name, setName] = useState<string>('');
  const [login, setLogin] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [saler, setSaler] = useState<boolean>(false); // For "register as saler" checkbox
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Local state for client-side validation errors
  const [nameError, setNameError] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');


  const handleRegisterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(clearAuthError()); // Clear previous API errors
    // Clear local validation errors
    setNameError('');
    setLoginError('');
    setPhoneError('');
    setPasswordError('');
    setConfirmPasswordError('');

    let isValid = true;
    if (!name) {
      setNameError('Поле с именем не должно быть пустым.');
      isValid = false;
    }
    if (!login) {
      setLoginError('Поле с логином не должно быть пустым.');
      isValid = false;
    }
    if (!phone) {
      setPhoneError('Поле с телефоном не должно быть пустым.');
      isValid = false;
    } else if (!isValidPhone(phone)) {
      setPhoneError('Неверный формат телефона.');
      isValid = false;
    }
    if (!password) {
      setPasswordError('Поле с паролем не должно быть пустым.');
      isValid = false;
    } else if (!isStrongPassword(password)) {
      setPasswordError('Пароль должен содержать минимум 8 символов, включая 1 заглавную букву, 1 строчную, 1 цифру и 1 спецсимвол.');
      isValid = false;
    }
    if (!confirmPassword) {
      setConfirmPasswordError('Поле для подтверждения пароля не должно быть пустым.');
      isValid = false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Пароли не совпадают.');
      isValid = false;
    }

    if (!isValid) return;

    const userData: RegistrationData = { name, login, phone, password };
    dispatch(registerUser({ userData, isSaler: saler }))
      .unwrap()
      .then(() => {
        // Navigation handled by useEffect watching isAuthenticated
      })
      .catch((errorPayload) => {
        // errorPayload is the string from rejectWithValue
        // Set loginError if the error is about existing user, otherwise it's a general authError
        if (typeof errorPayload === 'string' && (errorPayload.toLowerCase().includes('логин') || errorPayload.toLowerCase().includes('пользователь'))) {
            setLoginError(errorPayload);
        }
        // The global authError from Redux store will display other errors.
      });
  };
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate(saler ? ROUTES.MY_PRODUCTS : ROUTES.HOME_PAGE);
    }
  }, [isAuthenticated, navigate, saler]);

  // Clear auth error on component unmount
  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);
  
  const handleSetSaler = (e: ChangeEvent<HTMLInputElement>) => {
    setSaler(e.target.checked);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };
  
  // Display API error if it's not specific to a field already showing a local error
  const generalAuthError = authError && !loginError ? authError : null;

  return (
    <div className="Login">
      <div className="login-form">
        <img src={Logo} className="logo" alt="Logo" />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3>РЕГИСТРАЦИЯ</h3>
          {generalAuthError && <Typography color="error" sx={{ mb: 1, textAlign: 'center' }}>{generalAuthError}</Typography>}
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="input-container">
              <Field
                sx={{ minWidth: '272px' }}
                placeholder="Имя"
                value={name}
                onChange={(value: string) => { setName(value); setNameError(''); dispatch(clearAuthError()); }}
                error={!!nameError}
                helperText={nameError}
              />
            </div>
            <div className="input-container">
              <Field
                sx={{ minWidth: '272px' }}
                placeholder="Логин"
                value={login}
                onChange={(value: string) => { setLogin(value); setLoginError(''); dispatch(clearAuthError()); }}
                error={!!loginError || (!!authError && (authError.toLowerCase().includes('логин') || authError.toLowerCase().includes('пользователь')))}
                helperText={loginError || (authError && (authError.toLowerCase().includes('логин') || authError.toLowerCase().includes('пользователь')) ? authError : '')}
              />
            </div>
            <div className="input-container">
              <Field
                sx={{ minWidth: '272px' }}
                placeholder="Телефон"
                value={phone}
                onChange={(value: string) => { setPhone(value); setPhoneError(''); dispatch(clearAuthError()); }}
                mask={PHONE_MASK}
                error={!!phoneError}
                helperText={phoneError}
              />
            </div>
            <div className="input-container">
              <Field
                sx={{ minWidth: '272px' }}
                placeholder="Пароль"
                value={password}
                onChange={(value: string) => { setPassword(value); setPasswordError(''); dispatch(clearAuthError()); }}
                type={showPassword ? 'text' : 'password'}
                error={!!passwordError}
                helperText={passwordError}
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
                        {showConfirmPassword ? <VisibilityOffIcon sx={{ fontSize: '18px', mt: 1 }} /> : <VisibilityIcon sx={{ fontSize: '18px', mt: 1 }} />}
                      </span>
                    </InputAdornment>
                  ),
                }}
              />
            </div>
            <Typography>
              <StyledCheckbox checked={saler} onChange={handleSetSaler} />Зарегистрироваться как продавец
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