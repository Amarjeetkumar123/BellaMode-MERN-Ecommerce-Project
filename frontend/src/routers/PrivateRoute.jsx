import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

// Requires a logged-in user; optionally restricts to specific roles.
const PrivateRoute = ({ children, roles }) => {
    const { user } = useSelector((s) => s.auth);
    const { pathname, search } = useLocation();
    // sign-in sends them back here afterwards
    if (!user) return <Navigate to="/login" replace state={{ from: pathname + search }} />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
    return children;
};

export default PrivateRoute;
