// components/RequireProvider.tsx
import React, {ReactElement} from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface Props {
    children: ReactElement;
}

const RequireProvider: React.FC<Props> = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
            </div>
        </div>
    );

    if (!user) {
        console.warn('🔒 No user found, redirecting to login');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!user.spaceProvider) {
        console.warn('⚠️ User not a provider, redirecting to profile');
        return <Navigate to="/profile" state={{ scrollToUpgrade: true }} replace />;
    }

    return children;
};

export default RequireProvider;
