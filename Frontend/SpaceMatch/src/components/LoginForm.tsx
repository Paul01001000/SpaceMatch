import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface LoginFormProps {
    onSuccess: (user: any) => void;
    onRegister: () => void;
    onForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onRegister, onForgotPassword }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            const token = data.token;
            await login(token); // Store token

            const profileRes = await fetch('/api/auth/profile', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!profileRes.ok) {
                const profileErr = await profileRes.json();
                throw new Error(profileErr.message || 'Could not fetch profile');
            }

            const user = await profileRes.json();
            setErrorMsg('');
            onSuccess(user);
        } catch (err: any) {
            setErrorMsg(err.message);
            console.error(err);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
            <h2 className="text-xl font-bold mb-4">Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
                <input
                    className="w-full p-2 border rounded"
                    type="email"
                    placeholder="E-Mail"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <input
                    className="w-full p-2 border rounded"
                    type="password"
                    placeholder="Passwort"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                {errorMsg && (
                    <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                        <span className="text-lg">❌</span>
                        <span>{errorMsg}</span>
                    </div>
                )}
                <p className="mt-2 text-sm">
                    <button type="button" className="text-blue-600 hover:underline" onClick={onForgotPassword}>
                        Forgot password?
                    </button>
                </p>
                <button className="w-full bg-red-700 text-white py-2 rounded hover:bg-red-800" type="submit">
                    Log In
                </button>
            </form>
            <p className="mt-4 text-sm">
                Not registered yet?{' '}
                <button className="text-blue-600 hover:underline" onClick={onRegister}>
                    Register now
                </button>
            </p>
        </div>
    );
};

export default LoginForm;
