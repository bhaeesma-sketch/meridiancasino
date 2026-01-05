import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../App';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const context = useContext(AppContext);
  
  if (!context || !context.isConnected) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

