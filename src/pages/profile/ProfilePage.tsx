import { useState, useEffect } from 'react';
import { Box, Avatar, Button, Typography, Container, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'src/store/store';
import { updateUserThunk, fetchAuthenticatedUserThunk } from 'src/store/authSlice';
import { Field } from 'src/components';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { isStrongPassword } from 'src/constants';
import { Loader } from 'src/components';
import { User } from 'src/types';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { user, isLoading, error: authError, isSalerAccount } = useSelector((state: RootState) => state.auth);

  const [loginField, setLoginField] = useState('');
  const [nameField, setNameField] = useState('');
  const [phoneField, setPhoneField] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  
  const [loginErrorText, setLoginErrorText] = useState<string>('');
  const [passwordErrorText, setPasswordErrorText] = useState<string>('');
  const [confirmPasswordErrorText, setConfirmPasswordErrorText] = useState<string>('');
  
  useEffect(() => {
    if (!user && !isSalerAccount && !isLoading) { 
      dispatch(fetchAuthenticatedUserThunk());
    }
  }, [dispatch, user, isSalerAccount, isLoading]);

  useEffect(() => {
    if (user && !isSalerAccount) {
      setLoginField(user.login);
      setNameField(user.name || '');
      setPhoneField(user.phone);
      setPreview(user.img || null);
    }
  }, [user, isSalerAccount]);

  const handleLoginFieldChange = (value: string) => {
    setLoginField(value);
    if (loginErrorText) setLoginErrorText('');
  };

  const handleNameFieldChange = (value: string) => {
    setNameField(value);
  };

  const handlePhoneFieldChange = (value: string) => {
    setPhoneField(value);
  };
  
  const handlePasswordChange = (fieldName: 'newPassword' | 'confirmPassword') => (value: string) => {
    if (fieldName === 'newPassword') {
      setNewPassword(value);
      if (!value) {
        setPasswordErrorText('');
      } else if (!isStrongPassword(value)) {
        setPasswordErrorText('Пароль должен содержать минимум 8 символов, включая 1 заглавную букву, 1 строчную, 1 цифру и 1 спецсимвол.');
      } else {
        setPasswordErrorText('');
      }
      // Also validate confirmPassword if newPassword changes and confirmPassword is not empty
      if (confirmPassword && value !== confirmPassword) {
        setConfirmPasswordErrorText('Пароли не совпадают.');
      } else if (confirmPassword && value === confirmPassword) {
        setConfirmPasswordErrorText('');
      }
    } else if (fieldName === 'confirmPassword') {
      setConfirmPassword(value);
      if (!value) {
        setConfirmPasswordErrorText('');
      } else if (value !== newPassword) {
        setConfirmPasswordErrorText('Пароли не совпадают.');
      } else {
        setConfirmPasswordErrorText('');
      }
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrorText(''); setPasswordErrorText(''); setConfirmPasswordErrorText('');

    let isValid = true;
    if (newPassword && !isStrongPassword(newPassword)) {
        setPasswordErrorText('Пароль должен содержать минимум 8 символов, включая 1 заглавную букву, 1 строчную, 1 цифру и 1 спецсимвол.');
        isValid = false;
    }
    if (newPassword && newPassword !== confirmPassword) {
        setConfirmPasswordErrorText('Пароли не совпадают.');
        isValid = false;
    }
    if (!isValid) return;
    
    const formData = new FormData();
    let hasChanges = false;

    if (user && loginField !== user.login) { formData.append('login', loginField); hasChanges = true; }
    if (user && nameField !== (user.name || '')) { formData.append('name', nameField); hasChanges = true; }
    if (user && phoneField !== user.phone) { formData.append('phone', phoneField); hasChanges = true; }
    if (avatarFile) { formData.append('img', avatarFile); hasChanges = true; }
    if (newPassword) { formData.append('password', newPassword); hasChanges = true; }

    if (!hasChanges) {
      alert('Нет изменений для сохранения.');
      return;
    }

    dispatch(updateUserThunk(formData))
      .unwrap()
      .then(() => {
        alert('Профиль успешно обновлён!');
        setNewPassword(''); 
        setConfirmPassword('');
        setAvatarFile(null);
      })
      .catch((updateError: any) => {
        console.error('Error updating profile:', updateError);
        if (typeof updateError === 'string') {
            if (updateError.toLowerCase().includes('login')) {
                 setLoginErrorText(updateError);
            } else {
                alert(`Ошибка обновления: ${updateError}`);
            }
        } else {
          alert('Ошибка при обновлении профиля.');
        }
      });
  };

  const togglePasswordVisibility = () => setShowPassword(prev => !prev);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(prev => !prev);

  if (isLoading || (!user && !isSalerAccount && !isLoading)) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
        <Loader />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Редактирование профиля
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 300 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Avatar
            src={preview || '/broken-image.jpg'}
            sx={{ width: 80, height: 80, bgcolor: '#FF6428' }}
          >
            {loginField ? loginField[0].toUpperCase() : (user?.login ? user.login[0].toUpperCase() : 'U')}
          </Avatar>
        </Box>
        <Button variant="outlined" component="label" sx={{ borderRadius: '16px' }}>
          Загрузить аватар
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleAvatarChange}
          />
        </Button>
        <Field
          label="Логин"
          value={loginField}
          onChange={handleLoginFieldChange}
          error={!!loginErrorText || (!!authError && authError.toLowerCase().includes('login'))}
          helperText={loginErrorText || (authError && authError.toLowerCase().includes('login') ? authError : '')}
          fullWidth
        />
        <Field
          label="Имя"
          value={nameField}
          onChange={handleNameFieldChange}
          fullWidth
        />
        <Field
          label="Телефон"
          value={phoneField}
          onChange={handlePhoneFieldChange}
          fullWidth
        />
        <Field
          label="Новый пароль"
          value={newPassword}
          onChange={handlePasswordChange('newPassword')}
          type={showPassword ? 'text' : 'password'}
          error={!!passwordErrorText}
          helperText={passwordErrorText}
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
          error={!!confirmPasswordErrorText}
          helperText={confirmPasswordErrorText}
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