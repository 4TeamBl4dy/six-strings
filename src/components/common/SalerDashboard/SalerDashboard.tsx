import { AppProvider, Navigation } from '@toolpad/core/AppProvider';
import { DashboardLayout as ToolpadDashboardLayout } from '@toolpad/core/DashboardLayout';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux'; // Import useDispatch
import { AppDispatch } from 'src/store/store'; // Import AppDispatch
import { logout } from 'src/store/authSlice'; // Import logout action
import InventoryIcon from '@mui/icons-material/Inventory';
import StoreIcon from '@mui/icons-material/Store';
import BarChartIcon from '@mui/icons-material/BarChart';
import { Breadcrumbs, Title } from '../../';
import { demoTheme } from './styles';
import Logo from '/public/icons/smallLogo.png';
import { ROUTES } from 'src/constants'; // ROUTES is already imported
import { SidebarFooterProfile } from './FootDashboard/FootDasboard';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios'; // Keep axios for fetchSalerData for now
// import { removeToken } from 'src/hooks'; // removeToken is no longer needed

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
  const navigate = useNavigate(); // Already imported
  const dispatch: AppDispatch = useDispatch(); // Get dispatch
  const location = useLocation();
  const [saler, setSaler] = useState<Saler | null>(null); // Keep saler state for SidebarFooterProfile for now

  const fetchSalerData = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      dispatch(logout()); // Dispatch logout if no token
      navigate(ROUTES.LOGIN);
      return;
    }

    try {
      // Consider moving fetchSalerData to a thunk if saler data is needed globally in Redux
      const response = await axios.get('http://localhost:8080/saler', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { login, phone, name, img } = response.data;
      setSaler({ login, phone, name, img });
    } catch (error) {
      console.error('Error fetching saler data:', error);
      dispatch(logout()); // Dispatch logout on error
      navigate(ROUTES.LOGIN);
    }
  }, [navigate, dispatch]); // Added dispatch to dependencies

  useEffect(() => {
    fetchSalerData();
  }, [fetchSalerData]);

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN);
  };

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