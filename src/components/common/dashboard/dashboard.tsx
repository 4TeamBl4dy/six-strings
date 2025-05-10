import { AppProvider, Navigation } from '@toolpad/core/AppProvider';
import { DashboardLayout as ToolpadDashboardLayout } from '@toolpad/core/DashboardLayout';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import Contacts from '@mui/icons-material/Contacts';
import Favorite from '@mui/icons-material/Favorite';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import { Breadcrumbs, Title } from '../../';
import { demoTheme } from './styles';
import Logo from '/public/icons/smallLogo.png';
import { ROUTES } from 'src/constants';
import { SidebarFooterProfile } from './FootDashboard/FootDasboard'; 
import { useEffect, useState } from 'react';
import { removeToken } from 'src/hooks';

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
    icon: <Contacts />,
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

interface User {
  name: string;
  email: string;
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);

  // Получение данных пользователя
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

  }, [navigate]);

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
              <img
                src={Logo}
                alt="Logo"
                style={{ height: '40px', width: 'auto' }} // Настройте размер по необходимости
              />
              <Title size={'h3'} text={'SixStrings'} sx={{ paddingTop: 1, color: '#FF6428' }} />
            </NavLink>
          ),
          sidebarFooter: () => (
            <SidebarFooterProfile user={user} onLogout={handleLogout} />
          ),
        }}
      >
        <Breadcrumbs />
        <Outlet />
      </ToolpadDashboardLayout>
    </AppProvider>
  );
};