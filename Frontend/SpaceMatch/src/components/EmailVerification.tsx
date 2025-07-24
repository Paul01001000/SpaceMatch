import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const VerifyEmailStatus: React.FC = () => {
    const [searchParams] = useSearchParams();
    const status = searchParams.get('status');

    const isSuccess = status === 'success';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md text-center">
                <h2 className={`text-2xl font-bold mb-4 ${isSuccess ? 'text-red-700' : 'text-red-700'}`}>
                    {isSuccess ? 'Email Verified 🎉' : 'Verification Failed ❌'}
                </h2>
                <p className="text-gray-700 mb-6">
                    {isSuccess
                        ? 'Your email address has been successfully verified. You can now log in to your account.'
                        : 'The verification link is invalid or has expired. Please try registering again or contact support.'}
                </p>
                <Link
                    to={isSuccess ? '/login' : '/register'}
                    className="inline-block bg-red-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-800 transition"
                >
                    {isSuccess ? 'Log In Now' : 'Register Again'}
                </Link>
            </div>
        </div>
    );
};

export default VerifyEmailStatus;
