import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/store';
import { ROUTES } from "src/constants";
import React from "react"; // Removed useEffect, useState
import { Loader } from 'src/components/UI/loader'; // Assuming Loader is here

export function RequireToken({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // Removed useEffect for 'unauthorized' event listener as auth is now centralized in Redux.
  // If specific components still dispatch 'unauthorized', they should instead dispatch a Redux logout action.

  if (isLoading) {
    return <Loader />; // Or some other loading indicator
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return children; // React.ReactNode implies it can be a single child or multiple, JSX handles this.
}