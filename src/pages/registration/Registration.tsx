import './styles.css';
import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'src/store/store';
import { registerUserThunk, registerSalerThunk } from 'src/store/authSlice';
import Logo from '/public/icons/logo.png';
import { Box, Typography, InputAdornment } from '@mui/material';
// import { registerUser, registerSaler } from 'src/api'; // API calls are now in thunks
import { PHONE_MASK, ROUTES } from 'src/constants';
import { StyledCheckbox } from 'src/components/styledComponents';
import { Field } from 'src/components';
import { isValidPhone, isStrongPassword } from 'src/constants';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

// interface SignUpProps { // No longer needed
//   handleSetIsAuth: (token: string) => void;
// }

export default function Registration(/*{ handleSetIsAuth }: SignUpProps*/) {
  const dispatch: AppDispatch = useDispatch();
  const { isLoading, error: authError, isAuthenticated, isSalerAccount } = useSelector((state: RootState) => state.auth);

  const [name, setName] = useState<string>('');
  const [login, setLoginState] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [saler, setSalerFlag] = useState<boolean>(false);
  
  // Local form validation errors
  const [nameError, setNameError] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleRegistrationSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let isValid = true;
    setNameError(''); setLoginError(''); setPhoneError(''); setPasswordError(''); setConfirmPasswordError('');

    if (!name) { setNameError('Поле с именем не должно быть пустым.'); isValid = false; }
    if (!login) { setLoginError('Поле с логином не должно быть пустым.'); isValid = false; }
    if (!phone) { setPhoneError('Поле с телефоном не должно быть пустым.'); isValid = false; }
    else if (!isValidPhone(phone)) { setPhoneError('Неверный формат телефона.'); isValid = false; }
    if (!password) { setPasswordError('Поле с паролем не должно быть пустым.'); isValid = false; }
    else if (!isStrongPassword(password)) { setPasswordError('Пароль должен содержать минимум 8 символов, включая 1 заглавную букву, 1 строчную, 1 цифру и 1 спецсимвол.'); isValid = false; }
    if (!confirmPassword) { setConfirmPasswordError('Поле для подтверждения пароля не должно быть пустым.'); isValid = false; }
    else if (confirmPassword !== password) { setConfirmPasswordError('Пароли не совпадают.'); isValid = false; }

    if (!isValid) return;

    const userData = { login, password, name, phone };
    if (saler) {
      dispatch(registerSalerThunk(userData));
    } else {
      dispatch(registerUserThunk(userData));
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isSalerAccount ? ROUTES.MY_PRODUCTS : ROUTES.HOME_PAGE);
    }
  }, [isAuthenticated, isSalerAccount, navigate]);


  const handleSetSaler = (e: ChangeEvent<HTMLInputElement>) => {
    setSalerFlag(e.target.checked);
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
          <form onSubmit={handleRegistrationSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="input-container">
              <Field
                sx={{ minWidth: '272px' }}
                placeholder="Имя"
                value={name}
                onChange={(value: string) => setName(value)}
                error={!!nameError}
                helperText={nameError}
              />
            </div>
            <div className="input-container">
              <Field
                sx={{ minWidth: '272px' }}
                placeholder="Логин"
                value={login}
                onChange={(value: string) => setLoginState(value)}
                error={!!loginError || !!authError} // Show authError (e.g. login taken) on login field
                helperText={loginError || authError}
              />
            </div>
            <div className="input-container">
              <Field
                sx={{ minWidth: '272px' }}
                placeholder="Телефон"
                value={phone}
                onChange={(value: string) => setPhone(value)}
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
                onChange={(value: string) => setPassword(value)}
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
                error={!!confirmPasswordError}
                helperText={confirmPasswordError}
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
              <StyledCheckbox checked={saler} onChange={(e) => setSalerFlag(e.target.checked)} />Зарегистрироваться как продавец
            </Typography>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
            <NavLink to={ROUTES.LOGIN}>
              <a>Войти</a>
            </NavLink>
          </form>
        </Box>
      </div>
    </div>
  );
}