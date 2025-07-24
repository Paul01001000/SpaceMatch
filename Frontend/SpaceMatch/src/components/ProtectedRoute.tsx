import React, {ReactElement} from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
    children: ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user } = useAuth();

    if (!user) {
        // Not logged in → redirect to login
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
