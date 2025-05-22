import { AppProvider, Navigation } from '@toolpad/core/AppProvider';
import { DashboardLayout as ToolpadDashboardLayout } from '@toolpad/core/DashboardLayout';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import InventoryIcon from '@mui/icons-material/Inventory';
import StoreIcon from '@mui/icons-material/Store';
import BarChartIcon from '@mui/icons-material/BarChart';
import { Breadcrumbs, Title } from '../../';
import { demoTheme } from './styles';
import Logo from '/public/icons/smallLogo.png';
import { ROUTES } from 'src/constants';
import { SidebarFooterProfile } from './FootDashboard/FootDasboard';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { removeToken } from 'src/hooks';

// Навигация для продавца
const NAVIGATION: Navigation = [
  {
    segment: '/saler/my_products',
    title: 'Мои товары',
    icon: <InventoryIcon />,
  },
  {
    segment: '/saler/products',
    title: 'Товары других продавцов',
    icon: <StoreIcon />,
  },
  {
    segment: '/saler/stats',
    title: 'Статистика',
    icon: <BarChartIcon />,
  },
];

interface Saler {
  login: string;
  phone: string;
  name?: string;
  img?: string;
}

export const SalerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [saler, setSaler] = useState<Saler | null>(null);

  const fetchSalerData = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get('http://localhost:8080/saler', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const { login, phone, name, img } = response.data;
      setSaler({ login, phone, name, img });
    } catch (error) {
      console.error('Error fetching saler data:', error);
    }
  }, [navigate]);

  useEffect(() => {
    fetchSalerData();
  }, [fetchSalerData]);

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
            <SidebarFooterProfile user={saler} onLogout={handleLogout} refreshUser={fetchSalerData} />
          ),
        }}
      >
        <Breadcrumbs />
        <Outlet />
      </ToolpadDashboardLayout>
    </AppProvider>
  );
};