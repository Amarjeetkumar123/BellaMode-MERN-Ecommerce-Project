import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

// Requires a logged-in user; optionally restricts to specific roles.
const PrivateRoute = ({ children, roles }) => {
    const { user } = useSelector((s) => s.auth);
    if (!user) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
    return children;
};

export default PrivateRoute;
