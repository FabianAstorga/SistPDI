import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const RouteGuard = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/admin" replace />;
    }
    return <Outlet />;
};

export default RouteGuard;