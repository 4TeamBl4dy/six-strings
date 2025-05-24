import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ROUTES } from './constants';
import { Login, HomePage, CategoriesPage, Basket, FavoritesPage, CatalogPage, MyProductsPage, StatsPage, ProductsPage, ProfilePage, SalerProfilePage, SalerProductsPage } from './pages';
// Removed useState
import { Dashboard, RequireToken, SalerDashboard } from "./components";
import Registration from './pages/registration/Registration';
// No need to import useSelector or RootState here as RequireToken handles auth check internally for now.
// If App.tsx itself needed to make decisions based on isAuthenticated, we would import them.

function App() {
  // Local isAuth state and handleSetIsAuth are removed.
  // Authentication state is managed by Redux and checked by RequireToken.
  // Login and Registration components now dispatch Redux actions.

  return (
    <BrowserRouter>
      <Routes>
        {/* Login and Registration pages no longer need handleSetIsAuth prop */}
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTRATION} element={<Registration />} />
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