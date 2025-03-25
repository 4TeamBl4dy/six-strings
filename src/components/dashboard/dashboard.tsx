import { AppProvider, Navigation } from '@toolpad/core/AppProvider';
import { DashboardLayout as ToolpadDashboardLayout } from '@toolpad/core/DashboardLayout';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import Contacts from '@mui/icons-material/Contacts';
import Favorite from '@mui/icons-material/Favorite';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import { Breadcrumbs, Title } from '../'; 
import { demoTheme } from './dashboard';
import Logo from '../../../public/smallLogo.png'
import { ROUTES } from '../../constants';

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

export const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
            <NavLink to={ROUTES.HOME_PAGE} style={{display: 'flex', textDecoration: 'none'}}>
                <img
                src={Logo}
                alt="Logo"
                style={{ height: '40px', width: 'auto' }} // Настройте размер по необходимости
                />
                <Title size={'h3'} text={'SixStrings'} sx={{paddingTop: 1, color: '#FF6428'}} />
            </NavLink>
          ),
        }}
      >
        <Breadcrumbs />
        <Outlet />
      </ToolpadDashboardLayout>
    </AppProvider>
  );
};