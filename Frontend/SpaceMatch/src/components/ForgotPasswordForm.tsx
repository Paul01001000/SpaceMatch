import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleNotification from './SimpleNotification';

const ForgotPasswordForm = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch('/api/auth/request-password-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            setSubmitted(true);
        } catch (err) {
            setNotification({
                message: 'Fehler beim Senden der E-Mail.',
                type: 'error'
            });
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
            <h2 className="text-xl font-bold mb-4">Passwort vergessen</h2>

            {submitted ? (
                <div className="text-green-700">
                    Wenn die E-Mail existiert, wurde ein Link zum Zurücksetzen gesendet.
                    <button
                        onClick={() => navigate('/login')}
                        className="mt-4 text-blue-600 hover:underline block"
                    >
                        Return to Login
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="E-Mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full p-2 border rounded"
                    />
                    <button
                        type="submit"
                        className="w-full bg-red-700 text-white py-2 rounded hover:bg-red-800"
                    >
                        Request Link
                    </button>
                </form>
            )}

            {/* Notification Component */}
            {notification && (
                <SimpleNotification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
};

export default ForgotPasswordForm;
