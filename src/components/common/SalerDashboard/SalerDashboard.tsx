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
import { useEffect, useCallback } from 'react'; // Removed useState
import { useDispatch, useSelector } from 'react-redux'; // Import Redux hooks
// Removed removeToken and getSalerProfile
import { SalerPublicProfile } from '../../../types/saler'; // Still needed for type consistency if SidebarFooterProfile expects it.
                                                        // UserProfile from types/user could be used if SidebarFooterProfile's 'user' prop is UserProfile
import { AppDispatch, RootState } from '../../../storage/store';
import { logoutUser } from '../../../storage/features/authSlice';
import { fetchCurrentSalerProfile, clearUserProfile } from '../../../storage/features/userProfileSlice';

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

export const SalerDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  // Assuming authUser contains the necessary SalerPublicProfile fields if a saler is logged in.
  // Or, if userProfile.profile is specifically for saler profile after fetchCurrentSalerProfile.
  const authUser = useSelector((state: RootState) => state.auth.user); 
  const salerProfileForFooter = useSelector((state: RootState) => state.userProfile.profile);
  // Choose which profile to display. If userProfile.profile is fetched specifically for saler, use it.
  // Otherwise, authUser might have the basic info. SalerPublicProfile and UserProfile are compatible for SidebarFooterProfile.
  const displayUser = salerProfileForFooter || authUser;


  // Fetch saler-specific detailed profile if needed, or rely on authUser.
  useEffect(() => {
    // Only fetch if we don't have detailed profile or if authUser is the one to use (and exists)
    if (authUser?.login) { // Check if a user is logged in
        // Assuming a saler is logged in if they reach this dashboard.
        // Dispatch fetchCurrentSalerProfile to ensure saler-specific details are in userProfile.profile
        dispatch(fetchCurrentSalerProfile());
    }
  }, [dispatch, authUser]);

  const handleRefreshUser = useCallback(() => {
    dispatch(fetchCurrentSalerProfile());
  }, [dispatch]);

  // Обработчик выхода
  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(clearUserProfile()); // Clear the profile state
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