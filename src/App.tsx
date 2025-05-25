import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react'; // Import useEffect
import { useDispatch, useSelector } from 'react-redux'; // Import Redux hooks
import { AppDispatch, RootState } from './store/store'; // Import Redux types
import { fetchAuthenticatedUserThunk } from './store/authSlice'; // Import thunk
import { ROUTES } from './constants';
import { Login, HomePage, CategoriesPage, Basket, FavoritesPage, CatalogPage, MyProductsPage, StatsPage, ProductsPage, ProfilePage, SalerProfilePage, SalerProductsPage } from './pages';
// Removed useState as isAuth is now from Redux
import { Dashboard, RequireToken, SalerDashboard } from "./components";
import Registration from './pages/registration/Registration';

function App() {
  const dispatch: AppDispatch = useDispatch();
  const { token, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Check if a token exists (e.g., from previous session) but user not yet loaded in state
    if (token && !isAuthenticated && !isLoading) { 
      dispatch(fetchAuthenticatedUserThunk());
    }
    // If there's no token in localStorage (initialState.token would be null), 
    // and thus no token in Redux state, do nothing, user is not authenticated.
  }, [dispatch, token, isAuthenticated, isLoading]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Removed handleSetIsAuth prop from Login and Registration */}
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTRATION} element={<Registration />} />
        <Route
          element={
            <RequireToken> {/* RequireToken will use Redux state */}
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