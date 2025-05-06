import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ROUTES } from './constants';
import { Login, HomePage, CategoriesPage, Basket, FavoritesPage, CatalogPage, MyProductsPage } from './pages';
import { useState, useEffect } from 'react';
import { Dashboard, RequireToken, SalerDashboard } from "./components";
import Registration from './pages/registration/Registration';

function App() {
  const [isAuth, setIsAuth] = useState<string | null>(localStorage.getItem('access_token'));
  const handleSetIsAuth = (token: string) => {
    setIsAuth(token);
  };

  const [guitars, setGuitars] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8080/api/guitars')
      .then(res => res.json())
      .then(data => setGuitars(data))
      .catch(error => console.log(error));
  }, []);

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
          <Route path={ROUTES.CATEGORY} element={<CategoriesPage guitars={guitars} />} />
          <Route path={ROUTES.BASKET} element={<Basket />} />
          <Route path={ROUTES.FAVORITES} element={<FavoritesPage />} />
        </Route>
        <Route
          element={
            <RequireToken>
              <SalerDashboard />
            </RequireToken>
          }
        >
          <Route path={ROUTES.MY_PRODUCTS} element={<MyProductsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;