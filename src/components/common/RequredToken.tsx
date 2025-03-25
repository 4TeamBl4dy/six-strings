import { Navigate, useLocation } from "react-router-dom";
import { fetchToken } from "../../hooks";
import { ROUTES } from "../../constants";
import React, { useEffect, useState } from "react";

export function RequireToken({ children }: { children: React.ReactNode }) {
  const [unauthorized, setUnauthorized] = useState(false);
  const auth: string | null = fetchToken();
  const location = useLocation();

  useEffect(() => {
    const handleUnauthorized = () => setUnauthorized(true);

    window.addEventListener("unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("unauthorized", handleUnauthorized);
    };
  }, []);

  if (!auth || unauthorized) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} />;
  }

  return <>{children}</>;
}