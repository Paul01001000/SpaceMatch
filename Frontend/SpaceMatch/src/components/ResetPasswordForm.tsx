import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SimpleNotification from './SimpleNotification';

const passwordValid = (pwd: string) => {
    const hasMinLength = pwd.length >= 8;
    const hasUpper = /\p{Lu}/u.test(pwd);
    const hasLower = /\p{Ll}/u.test(pwd);
    const hasDigit = /\p{Nd}/u.test(pwd);
    const hasSpecial = /[^\p{L}\p{N}]/u.test(pwd);

    const complexityChecks = [hasUpper, hasLower, hasDigit, hasSpecial];
    const passedChecks = complexityChecks.filter(Boolean).length;

    return hasMinLength && passedChecks >= 3;
};


const ResetPasswordForm: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const [password, newPassword] = useState('');

    const [confirm, setConfirm] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!passwordValid(password)) {
            setNotification({
                message: 'Das Passwort erfüllt nicht die Komplexitätsanforderungen.',
                type: 'error'
            });
            return;
        }

        if (password !== confirm) {
            setMessage('Die Passwörter stimmen nicht überein.');
            return;
        }

        try {
            const res = await fetch(`/api/auth/reset-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({newPassword: password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            setMessage('✅ Passwort successfully chaged.');
            setTimeout(() => navigate('/'), 2000); // zurück zur LandingPage
        } catch (err: any) {
            setMessage(`❌ ${err.message || 'Error while changing password.'}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded shadow space-y-4">
            <h2 className="text-xl font-bold">Set new password</h2>

            <input type="password" className={`w-full border rounded px-4 py-2 ${password && !passwordValid ? 'border-red-500' : ''}`} placeholder="Password" value={password} onChange={(e) => newPassword(e.target.value)} required />
            <div className="text-sm mt-4 text-gray-700">
                <ul className="list-disc list-inside ml-2 space-y-1">
                    <li className={password.length >= 8 ? 'text-green-600' : 'text-red-600'}>
                        At least 8 characters
                    </li>
                </ul>
                <p className="mt-2">Password must include at least 3 of the following:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                    <li className={/\p{Lu}/u.test(password) ? 'text-green-600' : 'text-red-600'}>
                        One uppercase letter
                    </li>
                    <li className={/\p{Ll}/u.test(password) ? 'text-green-600' : 'text-red-600'}>
                        One lowercase letter
                    </li>
                    <li className={/\p{Nd}/u.test(password) ? 'text-green-600' : 'text-red-600'}>
                        One number
                    </li>
                    <li className={/[^\p{L}\p{N}]/u.test(password) ? 'text-green-600' : 'text-red-600'}>
                        One special character
                    </li>
                </ul>
            </div>
            <input
                type="password"
                placeholder="Repeat Password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="w-full border rounded px-4 py-2"
                required
            />

            <button type="submit" className="w-full bg-red-700 text-white py-2 rounded hover:bg-red-800">
                Submit
            </button>

            {message && <p className="text-sm mt-2">{message}</p>}

            {/* Notification Component */}
            {notification && (
                <SimpleNotification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
        </form>
    );
};

export default ResetPasswordForm;
