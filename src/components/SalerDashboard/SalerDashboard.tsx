import { AppProvider, Navigation } from '@toolpad/core/AppProvider';
import { DashboardLayout as ToolpadDashboardLayout } from '@toolpad/core/DashboardLayout';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import InventoryIcon from '@mui/icons-material/Inventory';
import StoreIcon from '@mui/icons-material/Store';
import BarChartIcon from '@mui/icons-material/BarChart';
import { Breadcrumbs, Title } from '../';
import { demoTheme } from './styles';
import Logo from '/public/icons/smallLogo.png';
import { ROUTES } from 'src/constants';
import { SidebarFooterProfile } from './FootDashboard/FootDasboard';
import { useEffect, useState } from 'react';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { removeToken } from 'src/hooks';

// Навигация для продавца
const NAVIGATION: Navigation = [
  {
    segment: '/saler/my_products',
    title: 'Мои товары',
    icon: <InventoryIcon />,
  },
  {
    segment: 'other-products',
    title: 'Товары других продавцов',
    icon: <StoreIcon />,
  },
  {
    segment: 'statistics',
    title: 'Статистика',
    icon: <BarChartIcon />,
  },
];

interface User {
  name: string;
  email: string;
}

export const SalerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);

  // Получение данных продавца
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    axios
      .get('http://localhost:8080/api/user', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response: AxiosResponse<User>) => {
        setUser(response.data);
      })
      .catch((error: AxiosError) => {
        console.error('Ошибка при загрузке данных продавца:', error);
        if (error.response?.status === 401) {
          removeToken();
          navigate('/login');
        }
      });
  }, [navigate]);

  // Обработчик выхода
  const handleLogout = () => {
    removeToken();
    localStorage.clear();
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
            <NavLink to={ROUTES.SALER_PAGE} style={{ display: 'flex', textDecoration: 'none' }}>
              <img
                src={Logo}
                alt="Logo"
                style={{ height: '40px', width: 'auto' }}
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