import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ROUTES } from './constants';
import Login from './pages/login/LoginPage';
import { useState } from 'react';
import { Dashboard, RequireToken } from "./components";

function App() {
  const token = localStorage.getItem('access_token');
  const [isAuth, setIsAuth] = useState<string | null>(localStorage.getItem('access_token')); // Указываем тип для isAuth
  const handleSetIsAuth = (token: string) => { // Указываем тип для token
    setIsAuth(token);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<Login handleSetIsAuth={handleSetIsAuth} />} />
        <Route
          element={
            <RequireToken>
              <Dashboard />
            </RequireToken>
          }
        >
          <Route path={ROUTES.HOME_PAGE} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;