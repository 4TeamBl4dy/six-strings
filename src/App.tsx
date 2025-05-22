import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ROUTES } from './constants';
import { Login, HomePage, CategoriesPage, Basket, FavoritesPage, CatalogPage, MyProductsPage, StatsPage, ProductsPage, ProfilePage, SalerProfilePage, SalerProductsPage } from './pages';
import { useState } from 'react';
import { Dashboard, RequireToken, SalerDashboard } from "./components";
import Registration from './pages/registration/Registration';

function App() {
  const [isAuth, setIsAuth] = useState<string | null>(localStorage.getItem('access_token'));
  const handleSetIsAuth = (token: string) => {
    setIsAuth(token);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<Login handleSetIsAuth={handleSetIsAuth} />} />
        <Route path={ROUTES.REGISTRATION} element={<Registration handleSetIsAuth={handleSetIsAuth} />} />
        <Route
          element={
            <RequireToken>
              <Dashboard />
            </RequireToken>
          }
        >
          <Route path={ROUTES.HOME_PAGE} element={<HomePage />} />
          <Route path={ROUTES.CATALOG} element={<CatalogPage />} />
          <Route path={ROUTES.CATEGORY} element={<CategoriesPage />} />
          <Route path={ROUTES.BASKET} element={<Basket />} />
          <Route path={ROUTES.FAVORITES} element={<FavoritesPage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} /> 
          <Route path={ROUTES.SALER_PRODUCTS} element={<SalerProductsPage />} />
        </Route>
        <Route
          element={
            <RequireToken>
              <SalerDashboard />
            </RequireToken>
          }
        >
          <Route path={ROUTES.MY_PRODUCTS} element={<MyProductsPage />} />
          <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
          <Route path={ROUTES.STATS} element={<StatsPage />} />
          <Route path={ROUTES.SALER_PROFILE} element={<SalerProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;