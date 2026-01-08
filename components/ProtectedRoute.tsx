import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AppContext } from '../App';
import { DepositWarningModal } from './DepositWarningModal';

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

  // Mandatory Security Gate: Only unlocked after verified on-chain deposit
  // Frontend check is a mirror of the backend 'has_deposited' state
  if (requireBalance && (context.user.total_deposited || 0) < 10) {
    // Show Security Terminal / Warning Modal
    return <DepositWarningModal />;
  }

  return <>{children}</>;
};

