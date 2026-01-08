import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AppContext } from '../App';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireBalance?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireBalance = false }) => {
  const context = useContext(AppContext);
  const location = useLocation();

  if (!context || !context.isConnected) {
    return <Navigate to="/" replace />;
  }

  // Step 5 Gate: Minimum 10 USDT real balance to play
  if (requireBalance && context.user.real_balance < 10) {
    return <Navigate to="/deposit" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

