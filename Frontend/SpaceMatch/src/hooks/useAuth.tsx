// useAuth.ts
import { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/User'; // Adjust the import path as necessary

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
    setUser: (user: User | null) => void;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const login = async (token: string) => {
        localStorage.setItem('token', token);
        try {
            const res = await fetch('/api/auth/profile', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
            } else {
                console.error('❌ Failed to fetch user profile after login');
                setUser(null);
            }
        } catch (err) {
            console.error('❌ Login fetch failed:', err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    // Optional: restore user from token on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            login(token);
        } else {
            setLoading(false);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
