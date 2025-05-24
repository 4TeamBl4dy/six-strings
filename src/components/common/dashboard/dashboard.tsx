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
import { useEffect, useCallback } from 'react'; // Removed useState
import { useDispatch, useSelector } from 'react-redux'; // Import Redux hooks
// Removed removeToken and getUserProfile
import { AppDispatch, RootState } from '../../../storage/store';
import { logoutUser } from '../../../storage/features/authSlice';
import { fetchUserProfile, clearUserProfile } from '../../../storage/features/userProfileSlice';

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

// Removed local User interface, will use UserProfile from types/user.ts
import { UserProfile } from '../../../types/user'; // Adjusted import path

export const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const authUser = useSelector((state: RootState) => state.auth.user);
  // If a more detailed profile is needed and fetched into userProfileSlice:
  // const userProfile = useSelector((state: RootState) => state.userProfile.profile);
  // const displayUser = userProfile || authUser; // Prefer more detailed profile if available

  // The user for SidebarFooterProfile will come from authUser.
  // If fetchUserProfile was dispatched on login and authUser is updated with all necessary fields,
  // then a separate fetch here might not be needed unless explicit refresh is desired.
  
  // Forcing a profile fetch if authUser exists but maybe not detailed enough for footer
  useEffect(() => {
    if (authUser?.login) { // Or based on isAuthenticated
      // Dispatch fetchUserProfile if you want to ensure the profile in userProfileSlice is fresh
      // and authUser might be minimal.
      // dispatch(fetchUserProfile()); 
    }
  }, [dispatch, authUser]);


  const handleRefreshUser = useCallback(() => {
    dispatch(fetchUserProfile()); // For the refreshUser prop
  }, [dispatch]);

  // Обработчик выхода
  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(clearUserProfile()); // Clear user profile state
    // Navigation to /login is typically handled by RequireToken or useEffect watching isAuthenticated
    navigate(ROUTES.LOGIN); 
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