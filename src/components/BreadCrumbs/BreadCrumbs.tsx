import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Breadcrumbs as MuiBreadcrumbs, Typography } from '@mui/material';
import { ROUTES } from '../../constants';
import Box from '@mui/material/Box';

interface BreadcrumbRoute {
  path: string;
  name: string;
}

const breadcrumbRoutes: BreadcrumbRoute[] = [
  { path: ROUTES.HOME_PAGE, name: 'Главная' },
  { path: ROUTES.CATALOG, name: 'Каталог' },
  { path: ROUTES.CATEGORY, name: 'Категория' },
  { path: ROUTES.BASKET, name: 'Корзина' },
  { path: ROUTES.FAVORITES, name: 'Избранное' },
  { path: ROUTES.MY_PRODUCTS, name: 'Мои товары' },
];

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const getBreadcrumbName = (pathname: string, fullPath: string, index: number): string => {
    // Проверяем точное совпадение маршрута (например, главная страница)
    const route = breadcrumbRoutes.find((r) => r.path === fullPath);
    if (route) return route.name;

    // Пропускаем сегменты, которые являются ID (UUID или числа)
    if (pathname.match(/^[0-9a-fA-F-]{36}$/) || !isNaN(Number(pathname))) {
      return '';
    }

    // Декодируем путь и форматируем название категории
    const decodedName = decodeURIComponent(pathname.replace(/_/g, ' '));
    // Делаем первую букву заглавной
    return decodedName.charAt(0).toUpperCase() + decodedName.slice(1);
  };

  const breadcrumbs = pathnames.map((value, index) => {
    const fullPath = `/${pathnames.slice(0, index + 1).join('/')}`;
    const to = fullPath;
    const name = getBreadcrumbName(value, fullPath, index);

    // Пропускаем пустые имена (например, id)
    if (!name) return null;

    const isLast = index === pathnames.length - 1;

    return isLast ? (
      <Typography key={to} color="text.primary">
        {name}
      </Typography>
    ) : (
      <Link key={to} to={to} style={{ textDecoration: 'none', color: '#1976d2' }}>
        {name}
      </Link>
    );
  }).filter(Boolean); // Убираем null значения

  return (
    <Box>
      <MuiBreadcrumbs aria-label="breadcrumb" sx={{ margin: '20px 0 0 25px' }}>
        <Link to={ROUTES.HOME_PAGE} style={{ textDecoration: 'none', color: '#FF6428' }}>
          Главная
        </Link>
        {breadcrumbs}
      </MuiBreadcrumbs>
    </Box>
  );
};