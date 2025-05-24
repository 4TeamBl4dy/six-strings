import { Navigate, useLocation, Outlet } from "react-router-dom"; // Added Outlet
// Removed fetchToken and React related imports not strictly needed for this version
import { ROUTES } from "src/constants";
import { useSelector } from 'react-redux';
import { RootState } from '../../../storage/store'; // Adjust path as necessary

// children prop is implicitly handled by Outlet now for route element usage
export function RequireToken() { 
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const location = useLocation();

  // The custom 'unauthorized' event listener logic is removed as it's an external mechanism.
  // Redux state (isAuthenticated) is now the source of truth.
  // If a global 'unauthorized' event needs to dispatch a Redux action (e.g., logout),
  // that should be set up elsewhere, e.g., in App.tsx or a main initialization file.

  if (!isAuthenticated) {
    // Pass the current location to redirect back after login
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />; 
}