import { AppProvider, Navigation } from '@toolpad/core/AppProvider';
import { DashboardLayout as ToolpadDashboardLayout } from '@toolpad/core/DashboardLayout';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux'; // Import useDispatch
import { AppDispatch } from 'src/store/store'; // Import AppDispatch
import { logout } from 'src/store/authSlice'; // Import logout action
import HomeIcon from '@mui/icons-material/Home';
import Contacts from '@mui/icons-material/Contacts';
import Favorite from '@mui/icons-material/Favorite';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import { Breadcrumbs, Title } from '../../';
import { demoTheme } from './styles';
import Logo from '/public/icons/smallLogo.png';
import { ROUTES } from 'src/constants'; // ROUTES is already imported
import { SidebarFooterProfile } from './FootDashboard/FootDasboard'; 
import { useEffect, useState, useCallback } from 'react';
// import { removeToken } from 'src/hooks'; // removeToken is no longer needed
import axios from 'axios'; // Keep axios for fetchUserData for now

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
  login: string;
  phone: string;
  name?: string;
  img?: string;
}

export const Dashboard = () => {
  const navigate = useNavigate(); // Already imported
  const dispatch: AppDispatch = useDispatch(); // Get dispatch
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null); // Keep user state for SidebarFooterProfile for now

  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      dispatch(logout()); // Dispatch logout if no token
      navigate(ROUTES.LOGIN);
      return;
    }

    try {
      // Consider moving fetchUserData to a thunk if user data is needed globally in Redux
      const response = await axios.get('http://localhost:8080/user', { 
        headers: { Authorization: `Bearer ${token}` },
      });
      const { login, phone, name, img } = response.data;
      setUser({ login, phone, name, img });
    } catch (error) {
      console.error('Error fetching user data:', error);
      dispatch(logout()); // Dispatch logout on error
      navigate(ROUTES.LOGIN);
    }
  }, [navigate, dispatch]); // Added dispatch to dependencies

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

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
            <NavLink to={ROUTES.HOME_PAGE} style={{ display: 'flex', textDecoration: 'none' }}>
              <img
                src={Logo}
                alt="Logo"
                style={{ height: '40px', width: 'auto' }}
              />
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