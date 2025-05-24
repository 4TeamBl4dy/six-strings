import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Box, Avatar, Button, Typography, Container, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Field, Loader } from 'src/components';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { isStrongPassword } from 'src/constants';
// SalerPublicProfile is compatible with UserProfile for display purposes in this slice
// import { SalerPublicProfile } from '../../../types/saler'; 
import { AppDispatch, RootState } from '../../../storage/store';
import {
  fetchCurrentSalerProfile,
  updateCurrentSalerProfileData,
  clearUserProfile, // To clear profile on logout or unmount
  clearUpdateError, // To clear previous update errors
} from '../../../storage/features/userProfileSlice';
import { logoutUser } from '../../../storage/features/authSlice';
import { ROUTES } from 'src/constants';

export const SalerProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { 
    profile: salerProfileData, // This will hold SalerPublicProfile data
    isLoading, 
    error: fetchProfileError, 
    isUpdating, 
    updateError 
  } = useSelector((state: RootState) => state.userProfile);
  
  const { isAuthenticated, user: authUser } = useSelector((state: RootState) => state.auth);

  // Local form state, initialized from Redux profile
  const [formLogin, setFormLogin] = useState('');
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  
  // Local client-side validation errors
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string>('');
  const [confirmPasswordErrorMsg, setConfirmPasswordErrorMsg] = useState<string>('');
  const [loginErrorMsg, setLoginErrorMsg] = useState<string>('');


  useEffect(() => {
    if (!isAuthenticated) { // Check general auth status
      navigate(ROUTES.LOGIN);
    } else {
      // Check if the logged-in user is a saler (e.g. based on a role in authUser or specific logic)
      // For now, assuming if they reach this page, they are a saler.
      dispatch(fetchCurrentSalerProfile());
    }
    return () => {
      dispatch(clearUpdateError()); 
    };
  }, [dispatch, isAuthenticated, navigate]);

  useEffect(() => {
    // Initialize form with profile data from Redux store
    if (salerProfileData) {
      setFormLogin(salerProfileData.login || '');
      setFormName(salerProfileData.name || '');
      setFormPhone(salerProfileData.phone || '');
      setPreview(salerProfileData.img || null);
    } else if (authUser) { // Fallback to authUser if profile is empty (e.g. initial load for a saler)
        setFormLogin(authUser.login || '');
        setFormName(authUser.name || '');
        setFormPhone(authUser.phone || '');
        // authUser might not have 'img', so preview might remain null
    }
  }, [salerProfileData, authUser]);

  const handleFieldChange = (setter: React.Dispatch<React.SetStateAction<string>>, fieldName?: string) => (value: string) => {
    setter(value);
    if (fieldName === 'login') setLoginErrorMsg('');
    dispatch(clearUpdateError()); 
  };

  const handlePasswordChange = (name: string) => (value: string) => {
    dispatch(clearUpdateError());
    if (name === 'newPassword') {
      setNewPassword(value);
      if (!value) {
        setPasswordErrorMsg('');
      } else if (!isStrongPassword(value)) {
        setPasswordErrorMsg('Пароль должен содержать минимум 8 символов, включая 1 заглавную букву, 1 строчную, 1 цифру и 1 спецсимвол.');
      } else {
        setPasswordErrorMsg('');
      }
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
      if (!value) {
        setConfirmPasswordErrorMsg('');
      } else if (value !== newPassword) {
        setConfirmPasswordErrorMsg('Пароли не совпадают.');
      } else {
        setConfirmPasswordErrorMsg('');
      }
    }
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      dispatch(clearUpdateError());
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(clearUpdateError());
    setLoginErrorMsg('');

    if (newPassword && !isStrongPassword(newPassword)) {
      setPasswordErrorMsg('Пароль не соответствует требованиям.');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setConfirmPasswordErrorMsg('Пароли не совпадают.');
      return;
    }
    if (!formLogin.trim()) {
      setLoginErrorMsg('Логин не может быть пустым.');
      return;
    }

    const formData = new FormData();
    let hasChanges = false;

    if (formLogin !== salerProfileData?.login) {
      formData.append('login', formLogin);
      hasChanges = true;
    }
    if (formName !== salerProfileData?.name) {
      formData.append('name', formName || '');
      hasChanges = true;
    }
    if (formPhone !== salerProfileData?.phone) {
      formData.append('phone', formPhone);
      hasChanges = true;
    }
    if (avatarFile) {
      formData.append('img', avatarFile);
      hasChanges = true;
    }
    if (newPassword) {
      formData.append('password', newPassword);
      hasChanges = true;
    }

    if (!hasChanges) {
      alert('Нет изменений для сохранения.');
      return;
    }

    dispatch(updateCurrentSalerProfileData(formData))
      .unwrap()
      .then(() => {
        alert('Профиль продавца успешно обновлён!');
        setNewPassword('');
        setConfirmPassword('');
        setAvatarFile(null);
      })
      .catch((errorPayload) => {
        if (typeof errorPayload === 'string' && errorPayload.toLowerCase().includes('логин')) {
            setLoginErrorMsg(errorPayload);
        }
      });
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(clearUserProfile()); 
    navigate(ROUTES.LOGIN);
  };

  const togglePasswordVisibility = () => setShowPassword(prev => !prev);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(prev => !prev);

  if (isLoading || (!salerProfileData && isAuthenticated)) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
        <Loader />
      </Container>
    );
  }
  
  if (fetchProfileError) {
      return <Typography color="error" sx={{textAlign: 'center', mt: 2}}>Ошибка загрузки профиля: {fetchProfileError}</Typography>;
  }
  
  if (!salerProfileData && !authUser) {
      return <Typography sx={{textAlign: 'center', mt: 2}}>Пожалуйста, войдите в систему.</Typography>;
  }

  const displayUpdateError = updateError || loginErrorMsg;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom maxWidth={300} textAlign={'center'}>
        Редактирование профиля продавца
      </Typography>
      {displayUpdateError && <Typography color="error" sx={{ mb: 1, textAlign: 'center' }}>{displayUpdateError}</Typography>}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 300, margin: 'auto' }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Avatar
            src={preview || '/broken-image.jpg'}
            sx={{ width: 80, height: 80, bgcolor: '#FF6428' }}
          >
            {formLogin ? formLogin[0].toUpperCase() : 'S'}
          </Avatar>
        </Box>
        <Button variant="outlined" component="label" sx={{ borderRadius: '16px' }}>
          Загрузить аватар
          <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
        </Button>
        <Field
          label="Логин"
          value={formLogin}
          onChange={handleFieldChange(setFormLogin, 'login')}
          error={!!loginErrorMsg}
          helperText={loginErrorMsg}
          fullWidth
        />
        <Field
          label="Имя"
          value={formName}
          onChange={handleFieldChange(setFormName)}
          fullWidth
        />
        <Field
          label="Телефон"
          value={formPhone}
          onChange={handleFieldChange(setFormPhone)}
          fullWidth
        />
        <Field
          label="Новый пароль"
          value={newPassword}
          onChange={handlePasswordChange('newPassword')}
          type={showPassword ? 'text' : 'password'}
          error={!!passwordErrorMsg}
          helperText={passwordErrorMsg}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <span className="eye-icon" onClick={togglePasswordVisibility}>
                  {showPassword ? <VisibilityOffIcon sx={{ fontSize: '18px', mt: 1 }} /> : <VisibilityIcon sx={{ fontSize: '18px', mt: 1 }} />}
                </span>
              </InputAdornment>
            ),
          }}
          fullWidth
        />
        <Field
          label="Подтвердите пароль"
          value={confirmPassword}
          onChange={handlePasswordChange('confirmPassword')}
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
          fullWidth
        />
        <Button type="submit" variant="contained" color="primary" sx={{ borderRadius: '16px' }}>
          Сохранить
        </Button>
      </Box>
    </Container>
  );
};