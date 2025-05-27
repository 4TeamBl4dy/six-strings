import { AppProvider, Navigation } from '@toolpad/core/AppProvider';
import { DashboardLayout as ToolpadDashboardLayout } from '@toolpad/core/DashboardLayout';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ImportContactsIcon from '@mui/icons-material/ImportContacts';
import Favorite from '@mui/icons-material/Favorite';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import { Breadcrumbs, Title } from '../../';
import { demoTheme } from './styles';
import Logo from '/public/icons/smallLogo.png';
import { ROUTES } from 'src/constants';
import { SidebarFooterProfile } from './FootDashboard/FootDasboard';
import { useEffect, useState, useCallback } from 'react';
import { removeToken } from 'src/hooks';
import { User } from 'src/types';
import apiClient from 'src/api';

// Навигация
const NAVIGATION: Navigation = [
    {
        segment: '',
        title: 'Главная',
        icon: <HomeIcon />,
    },
    {
        segment: 'catalog',
        title: 'Каталог',
        icon: <ImportContactsIcon />,
    },
    {
        segment: 'favorites',
        title: 'Избранное',
        icon: <Favorite />,
    },
    {
        segment: 'basket',
        title: 'Корзина',
        icon: <ShoppingCart />,
    },
];

export const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<User | null>(null);

    const fetchUserData = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await apiClient.get('/user', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const { login, phone, name, img } = response.data;
            setUser({ login, phone, name, img });
        } catch (error) {
            console.error('Error fetching user data:', error);
            removeToken();
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    // Обработчик выхода
    const handleLogout = () => {
        removeToken();
        navigate('/login');
    };

    // Кастомный роутер для Toolpad
    const router = {
        pathname: location.pathname,
        searchParams: new URLSearchParams(location.search),
        navigate: (path: string | URL) => navigate(path),
    };

    return (
        <AppProvider navigation={NAVIGATION} router={router} theme={demoTheme}>
            <ToolpadDashboardLayout
                slots={{
                    appTitle: () => (
                        <NavLink to={ROUTES.HOME_PAGE} style={{ display: 'flex', textDecoration: 'none' }}>
                            <img src={Logo} alt="Logo" style={{ height: '40px', width: 'auto' }} />
                            <Title size={'h3'} text={'SixStrings'} sx={{ paddingTop: 1, color: '#FF6428' }} />
                        </NavLink>
                    ),
                    sidebarFooter: () => (
                        <SidebarFooterProfile user={user} onLogout={handleLogout} refreshUser={fetchUserData} />
                    ),
                }}
            >
                <Breadcrumbs />
                <Outlet />
            </ToolpadDashboardLayout>
        </AppProvider>
    );
};
