import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/auth';

const RouteViewer = () => {
  // Clear object mapping instead of index skipping array assignment [auth, , loading]
  const { auth, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const hasAccess = auth?.token && auth?.role === "viewer";
  return hasAccess ? <Outlet /> : <Navigate to="/login" replace />;
};

export default RouteViewer;
