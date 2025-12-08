import React from 'react';
import { Navigate } from 'react-router-dom';

// Protected Route for Provider Portal
export const ProtectedProviderRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');

  if (!token) {
    return <Navigate to="/provider/login" replace />;
  }

  if (userType !== 'provider') {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Protected Route for Patient Portal
export const ProtectedPatientRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');

  if (!token) {
    return <Navigate to="/patient/login" replace />;
  }

  if (userType !== 'patient') {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Protected Route for Admin Portal
export const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  if (userType !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Generic Protected Route (checks if any valid token exists)
export const ProtectedRoute = ({ children, allowedUserTypes = [] }) => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(userType)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
