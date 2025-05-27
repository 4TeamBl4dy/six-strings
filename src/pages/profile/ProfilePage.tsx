import { useState, useEffect } from 'react';
import { Box, Avatar, Button, Typography, Container, InputAdornment } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Field, useToast, Loader } from 'src/components';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { isStrongPassword } from 'src/constants';
import { User } from 'src/types';
import apiClient from 'src/api';

export const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User>({
        login: '',
        phone: '',
        name: '',
        img: '',
    });
    const [initialUser, setInitialUser] = useState<User | null>(null); // Для отслеживания начальных значений
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [passwordError, setPasswordError] = useState<boolean>(false);
    const [confirmPasswordError, setConfirmPasswordError] = useState<boolean>(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState<string>('');
    const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = useState<string>('');
    const [loginError, setLoginError] = useState<boolean>(false);
    const [loginErrorMessage, setLoginErrorMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const { showToast } = useToast();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }

        apiClient
            .get('/user', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((response) => {
                setLoading(true);
                const { login, phone, name, img } = response.data;
                const userData = { login, phone, name: name || '', img: img || '' };
                setUser(userData);
                setInitialUser(userData); // Сохраняем начальные значения
                setPreview(img || null);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching user data:', error);
                navigate('/login');
            });
    }, [navigate]);

    const handleFieldChange = (name: string) => (value: string) => {
        setUser((prev) => ({ ...prev, [name]: value }));
        if (name === 'login') {
            setLoginError(false);
            setLoginErrorMessage('');
        }
    };

    const handlePasswordChange = (name: string) => (value: string) => {
        if (name === 'newPassword') {
            setNewPassword(value);
            if (!value) {
                setPasswordError(false);
                setPasswordErrorMessage('');
            } else if (!isStrongPassword(value)) {
                setPasswordError(true);
                setPasswordErrorMessage(
                    'Пароль должен содержать минимум 8 символов, включая 1 заглавную букву, 1 строчную, 1 цифру и 1 спецсимвол.'
                );
            } else {
                setPasswordError(false);
                setPasswordErrorMessage('');
            }
        } else if (name === 'confirmPassword') {
            setConfirmPassword(value);
            if (!value) {
                setConfirmPasswordError(false);
                setConfirmPasswordErrorMessage('');
            } else if (value !== newPassword) {
                setConfirmPasswordError(true);
                setConfirmPasswordErrorMessage('Пароли не совпадают.');
            } else {
                setConfirmPasswordError(false);
                setConfirmPasswordErrorMessage('');
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
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const formData = new FormData();
        let hasChanges = false;

        if (user.login !== initialUser?.login) {
            formData.append('login', user.login);
            hasChanges = true;
        }
        if (user.name !== initialUser?.name) {
            formData.append('name', user.name || '');
            hasChanges = true;
        }
        if (user.phone !== initialUser?.phone) {
            formData.append('phone', user.phone);
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
            showToast('Нет изменений для сохранения.', 'info');
            return;
        }

        try {
            const response = await apiClient.put('/user', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            const updatedUser = response.data;
            setUser(updatedUser);
            setInitialUser(updatedUser); // Обновляем начальные значения
            setPreview(updatedUser.img || null);
            setAvatarFile(null);
            setNewPassword('');
            setConfirmPassword('');
            if (response.headers.authorization) {
                localStorage.setItem('access_token', response.headers.authorization.split(' ')[1]);
            }
            showToast('Профиль успешно обновлён!', 'success');
        } catch (error) {
            console.error('Error updating profile:');
        }
    };

    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((prev) => !prev);

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
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
                    <Avatar src={preview || '/broken-image.jpg'} sx={{ width: 80, height: 80, bgcolor: '#FF6428' }}>
                        {user.login ? user.login[0] : 'U'}
                    </Avatar>
                </Box>
                <Button variant="outlined" component="label" sx={{ borderRadius: '16px' }}>
                    Загрузить аватар
                    <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                </Button>
                <Field
                    label="Логин"
                    value={user.login}
                    onChange={handleFieldChange('login')}
                    error={loginError}
                    helperText={loginErrorMessage}
                    fullWidth
                />
                <Field label="Имя" value={user.name || ''} onChange={handleFieldChange('name')} fullWidth />
                <Field label="Телефон" value={user.phone} onChange={handleFieldChange('phone')} fullWidth />
                <Field
                    label="Новый пароль"
                    value={newPassword}
                    onChange={handlePasswordChange('newPassword')}
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
                                    {showConfirmPassword ? (
                                        <VisibilityOffIcon sx={{ fontSize: '18px', mt: 1 }} />
                                    ) : (
                                        <VisibilityIcon sx={{ fontSize: '18px', mt: 1 }} />
                                    )}
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
