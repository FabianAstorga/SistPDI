import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const RouteGuard = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/panel" replace />;
    }
    return <Outlet />;
};

export default RouteGuard;