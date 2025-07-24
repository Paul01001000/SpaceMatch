import { useState } from 'react';
import { register } from '../services/register';
import { useAuth } from '../hooks/useAuth';
import { User } from '../types/User'; // Adjust the import path as necessary
import SimpleNotification from './SimpleNotification';

interface RegisterFormProps {
     onLogin: () => void;
}

const isValidPassword = (pwd: string) => {
    const hasMinLength = pwd.length >= 8;
    const hasUpper = /\p{Lu}/u.test(pwd);
    const hasLower = /\p{Ll}/u.test(pwd);
    const hasDigit = /\p{Nd}/u.test(pwd);
    const hasSpecial = /[^\p{L}\p{N}]/u.test(pwd);

    const complexityChecks = [hasUpper, hasLower, hasDigit, hasSpecial];
    const passedChecks = complexityChecks.filter(Boolean).length;

    return hasMinLength && passedChecks >= 3;
};

const RegisterForm: React.FC<RegisterFormProps> = ({onLogin }) => {

    const [isProvider, setIsProvider] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [emailRepeat, setEmailRepeat] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');
    const [iban, setIban] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

    const allRequiredFilled = !!email && !!emailRepeat && !!password && !!passwordRepeat && !!firstName && !!lastName;
    const emailsMatch = email === emailRepeat;
    const passwordsMatch = password === passwordRepeat;
    const passwordValid = isValidPassword(password);
    const providerValid = !isProvider || (!!iban && !!street && !!city && !!postalCode);

    const isFormValid = allRequiredFilled && emailsMatch && passwordsMatch && passwordValid && providerValid;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        try {
            await register({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                password,
                spaceProvider: isProvider,
                ...(isProvider && {
                    iban: iban.trim(),
                    address: {
                        street: street.trim(),
                        city: city.trim(),
                        postalCode: postalCode.trim(),
                    },
                }),
            });

            setSubmitted(true);
        } catch (error: any) {
            console.error('Registration error:', error);
            setNotification({
                message: error?.message || 'Registration failed',
                type: 'error'
            });
        }
    };

    if (submitted) {
        return (
            <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded text-center">
                <h2 className="text-xl font-semibold mb-4">Verify your Email</h2>
                <p className="text-gray-700 mb-2">
                    We've sent a verification link to <strong>{email}</strong>.
                </p>
                <p className="text-gray-700 mb-4">
                    Please check your inbox and confirm your email to continue.
                </p>
                <button
                    type="button"
                    onClick={onLogin}
                    className="text-sm text-blue-600 hover:underline"
                >
                    Already verified? Log in
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white shadow-md rounded">
            <div className="flex justify-center mb-6">
                <div className="grid grid-cols-2 w-full max-w-md border-b border-gray-300">
                    <button
                        type="button"
                        onClick={() => setIsProvider(false)}
                        className={`py-3 text-center font-medium transition-colors ${
                            !isProvider
                                ? 'text-black border-b-4 border-red-700'
                                : 'text-gray-400 border-b-4 border-gray-300'
                        }`}
                    >
                        Register as User
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsProvider(true)}
                        className={`py-3 text-center font-medium transition-colors ${
                            isProvider
                                ? 'text-black border-b-4 border-red-700'
                                : 'text-gray-400 border-b-4 border-gray-300'
                        }`}
                    >
                        Register as Provider
                    </button>
                </div>
            </div>
            <div className="space-y-4">
                <input className="w-full border rounded px-4 py-2" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                <input className="w-full border rounded px-4 py-2" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                <input className={`w-full border rounded px-4 py-2 ${email && emailRepeat && email !== emailRepeat ? 'border-red-500' : ''}`} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input className={`w-full border rounded px-4 py-2 ${email && emailRepeat && email !== emailRepeat ? 'border-red-500' : ''}`} placeholder="Repeat Email" value={emailRepeat} onChange={(e) => setEmailRepeat(e.target.value)} required />
                {email && emailRepeat && email !== emailRepeat && <p className="text-red-600 text-sm">Emails do not match</p>}

                <input type="password" className={`w-full border rounded px-4 py-2 ${password && !passwordValid ? 'border-red-500' : ''}`} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
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
                <input type="password" className={`w-full border rounded px-4 py-2 ${passwordRepeat && password !== passwordRepeat ? 'border-red-500' : ''}`} placeholder="Repeat Password" value={passwordRepeat} onChange={(e) => setPasswordRepeat(e.target.value)} required />
                {passwordRepeat && password !== passwordRepeat && <p className="text-red-600 text-sm">Passwords do not match</p>}

                {isProvider && (
                    <>
                        <input className="w-full border rounded px-4 py-2" placeholder="IBAN" value={iban} onChange={(e) => setIban(e.target.value)} required />
                        <input className="w-full border rounded px-4 py-2" placeholder="Street" value={street} onChange={(e) => setStreet(e.target.value)} required />
                        <input className="w-full border rounded px-4 py-2" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
                        <input className="w-full border rounded px-4 py-2" placeholder="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
                    </>
                )}

                <button
                    type="submit"
                    disabled={!isFormValid}
                    className={`w-full py-3 rounded font-bold mt-4 transition ${
                        isFormValid ? 'bg-red-700 text-white hover:bg-red-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    Register
                </button>

                <div className="text-center mt-4">
                    <button type="button" className="text-sm text-blue-600 hover:underline" onClick={onLogin}>
                        Already have an account? Log in
                    </button>
                </div>
            </div>

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

export default RegisterForm;
