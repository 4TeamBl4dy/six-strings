import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Box, Avatar, Button, Typography, Container, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Field, Loader } from 'src/components';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { isStrongPassword } from 'src/constants';
import { UserProfile } from '../../types/user';
import { AppDispatch, RootState } from '../../storage/store';
import { 
  fetchUserProfile, 
  updateUserProfileData, 
  clearUserProfile, 
  clearUpdateError,
  setUpdateError as setUserProfileUpdateError // To avoid name clash
} from '../../storage/features/userProfileSlice';
import { logoutUser } from '../../storage/features/authSlice';
import { ROUTES } from 'src/constants';


export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { 
    profile, 
    isLoading, 
    error: fetchProfileError, 
    isUpdating, 
    updateError 
  } = useSelector((state: RootState) => state.userProfile);
  
  const { isAuthenticated, user: authUser } = useSelector((state: RootState) => state.auth);

  // Local form state, initialized from Redux profile or authUser
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
  const [passwordError, setPasswordErrorMsg] = useState<string>(''); // Renamed for clarity
  const [confirmPasswordError, setConfirmPasswordErrorMsg] = useState<string>(''); // Renamed for clarity
  const [loginError, setLoginErrorMsg] = useState<string>(''); // Renamed for clarity

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
    } else {
      dispatch(fetchUserProfile());
    }
    return () => {
      // Clear user profile data when component unmounts or user logs out
      // dispatch(clearUserProfile()); // Or handle this on logoutUser action globally
      dispatch(clearUpdateError()); // Clear any update errors
    };
  }, [dispatch, isAuthenticated, navigate]);

  useEffect(() => {
    // Initialize form with profile data from Redux store
    // Fallback to authUser if profile is not yet loaded (e.g., initial load)
    const sourceUser = profile || authUser;
    if (sourceUser) {
      setFormLogin(sourceUser.login || '');
      setFormName(sourceUser.name || '');
      setFormPhone(sourceUser.phone || '');
      setPreview(sourceUser.img || null);
    }
  }, [profile, authUser]);


  const handleFieldChange = (setter: React.Dispatch<React.SetStateAction<string>>, fieldName?: string) => (value: string) => {
    setter(value);
    if (fieldName === 'login') setLoginErrorMsg('');
    dispatch(clearUpdateError()); // Clear API error on field change
  };

  const handlePasswordChange = (name: string) => (value: string) => {
    dispatch(clearUpdateError()); // Clear API error on field change
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
    setLoginErrorMsg(''); // Clear local login error

    // Client-side validation for password if new password is set
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

    // Compare with 'profile' from Redux, not 'initialUser' from local state
    if (formLogin !== profile?.login) {
      formData.append('login', formLogin);
      hasChanges = true;
    }
    if (formName !== profile?.name) {
      formData.append('name', formName || '');
      hasChanges = true;
    }
    if (formPhone !== profile?.phone) {
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

    dispatch(updateUserProfileData(formData))
      .unwrap()
      .then(() => {
        alert('Профиль успешно обновлён!');
        setNewPassword('');
        setConfirmPassword('');
        setAvatarFile(null); // Clear avatar file after successful upload
        // Optionally re-fetch or rely on the slice to update the 'profile' state
        // dispatch(fetchUserProfile()); // if server returns minimal data
      })
      .catch((errorPayload) => {
        // errorPayload is the string from rejectWithValue
        // The global updateError from Redux store will display this.
        // If specific field highlighting is needed:
        if (typeof errorPayload === 'string' && errorPayload.toLowerCase().includes('логин')) {
            setLoginErrorMsg(errorPayload);
        }
      });
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(clearUserProfile()); // Clear profile data on logout
    navigate(ROUTES.LOGIN);
  };

  const togglePasswordVisibility = () => setShowPassword(prev => !prev);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(prev => !prev);

  if (isLoading || (!profile && isAuthenticated)) { // Show loader if loading or if authenticated but profile not yet set
    return (
      <Container sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
        <Loader />
      </Container>
    );
  }
  
  if (fetchProfileError) {
      return <Typography color="error" sx={{textAlign: 'center', mt: 2}}>Ошибка загрузки профиля: {fetchProfileError}</Typography>;
  }
  
  if (!profile && !authUser) { // Should be redirected by useEffect, but as a fallback
      return <Typography sx={{textAlign: 'center', mt: 2}}>Пожалуйста, войдите в систему.</Typography>;
  }

  // Determine overall error message to display for updates
  const displayUpdateError = updateError || loginError;


  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Редактирование профиля
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
            {formLogin ? formLogin[0].toUpperCase() : 'U'}
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
          error={!!loginError}
          helperText={loginError}
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