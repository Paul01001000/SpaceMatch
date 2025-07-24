import { useEffect, useState, useRef } from 'react';
import { getProfile, updateProfile } from '../services/profile';
import defaultUserImage from '../assets/user.svg';
import { useSearchParams, useLocation } from 'react-router-dom';
import SimpleNotification from './SimpleNotification';


interface ProfileFormProps {
    token: string;
    setCurrentView: (view: string) => void;
}

const ProfilePage: React.FC<ProfileFormProps> = ({ token, setCurrentView }) => {

    type UpgradeState = { scrollToUpgrade?: boolean };

    const [userData, setUserData] = useState<any>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordChangeMessage, setPasswordChangeMessage] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [deletionMessage, setDeletionMessage] = useState('');
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const scrollToUpgrade = searchParams.get('upgrade') === 'true';
    const [shouldScroll, setShouldScroll] = useState<boolean>(false);
    const isUpgradeValid = userData?.iban &&
        userData?.address?.street &&
        userData?.address?.city &&
        userData?.address?.postalCode;

    useEffect(() => {
        const fetchProfile = async () => {
            const profile = await getProfile(token);
            setUserData(profile);

            if (profile.profilePicture) {
                setProfilePicturePreview(profile.profilePicture);
            } else {
                setProfilePicturePreview(defaultUserImage); // Fallback auf default
            }
        };
        fetchProfile();
    }, [token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setUserData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setSelectedFile(file);
        console.log('📷 Datei gewählt:', file);

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                console.log('📷 Base64-Vorschau:', reader.result);
                setProfilePicturePreview(reader.result as string);
                setUserData((prev: any) => ({
                    ...prev,
                    profilePicture: reader.result, // speichert Base64 im userData für den PUT Request
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePasswordChange = async () => {
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setPasswordChangeMessage('✅ Password sccuessfully changed.');
        } catch (err: any) {
            setPasswordChangeMessage(`❌ ${err.message}`);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(userData),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Unknown error while updating profile.');
            }

            setNotification({
                message: 'Profile updated successfully!',
                type: 'success'
            });
            setCurrentView('');
        } catch (error: any) {
            setNotification({
                message: `Error while updating profile: ${error.message}`,
                type: 'error'
            });
        }
    };


    const handleDeleteAccount = async () => {
        try {
            const res = await fetch('/api/auth/profile', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (res.status === 200) {
                setNotification({
                    message: 'Account successfully deleted.',
                    type: 'success'
                });
                // Clear token (localStorage, memory, etc.)
                localStorage.removeItem('token'); // if stored there
                setCurrentView('');
                window.location.reload(); // or use your logout handler
            } else if (res.status === 404) {
                setNotification({
                    message: 'Account not found or already deleted.',
                    type: 'error'
                });
            } else if (res.status === 401) {
                setNotification({
                    message: 'You are not authorized.',
                    type: 'error'
                });
            } else {
                const error = await res.json();
                setNotification({
                    message: `Error: ${error.message}`,
                    type: 'error'
                });
            }
        } catch (err) {
            console.error('Delete error:', err);
            setNotification({
                message: 'A network or server error occurred.',
                type: 'error'
            });
        }
    };
    const iban = userData?.iban || '';
    const street = userData?.address?.street || '';
    const city = userData?.address?.city || '';
    const postalCode = userData?.address?.postalCode || '';

    const upgradeRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (location.state?.scrollToUpgrade) {
            setShouldScroll(true);
        }
    }, [location.state]);

    useEffect(() => {
        if (shouldScroll && userData && upgradeRef.current) {
            upgradeRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [shouldScroll, userData, upgradeRef]);

    useEffect(() => {
        if (location.state?.scrollToUpgrade) {
            window.history.replaceState({}, document.title);
        }
    }, []);



    const handleUpgradeToProvider = async () => {
        if (!iban || !street || !city || !postalCode) {
            setNotification({
                message: "Please fill in all required fields to become a provider.",
                type: 'error'
            });
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    spaceProvider: true,
                    iban,
                    address: {
                        street,
                        city,
                        postalCode,
                    },
                }),
            });

            if (!res.ok) {
                const contentType = res.headers.get('content-type');
                const errorMessage = contentType?.includes('application/json')
                    ? (await res.json()).message
                    : await res.text(); // fallback

                setNotification({
                    message: errorMessage || "Upgrade failed.",
                    type: 'error'
                });
                return;
            }

            const updatedUser = await res.json();
            setUserData(updatedUser); // Update user context
            setNotification({
                message: "🎉 You are now a space provider!",
                type: 'success'
            });
        } catch (err) {
            console.error(err);
            setNotification({
                message: "An error occurred while upgrading.",
                type: 'error'
            });
        }
    };


    if (!userData) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading Profile...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen overflow-auto">
            <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded shadow space-y-4">
                <h2 className="text-xl font-bold">Edit Profile</h2>

                {profilePicturePreview && (
                    <img
                        src={profilePicturePreview || defaultUserImage}
                        alt="Profilepicture Preview"
                        className="w-24 h-24 rounded-full object-cover border mx-auto"
                    />
                )}

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full border-gray-300 border p-2"
                />

                <input name="firstName" value={userData.firstName} onChange={handleChange} className="w-full border p-2" placeholder="Firstname" />
                <input name="lastName" value={userData.lastName} onChange={handleChange} className="w-full border p-2" placeholder="Lastname" />
                <input name="mobileNumber" value={userData.mobileNumber || ''} onChange={handleChange} className="w-full border p-2" placeholder="Mobilenumber" />
                <input name="birthdate" value={userData.birthdate?.substring(0, 10) || ''} onChange={handleChange} type="date" className="w-full border p-2" />
                <textarea name="bio" value={userData.bio || ''} onChange={handleChange} className="w-full border p-2" placeholder="Bio" />

                {userData.spaceProvider && (
                    <>
                        <input name="iban" value={userData.iban || ''} onChange={handleChange} className="w-full border p-2" placeholder="IBAN" />
                        <input name="address.street" value={userData.address?.street || ''} onChange={handleChange} className="w-full border p-2" placeholder="Adress" />
                        <input name="address.city" value={userData.address?.city || ''} onChange={handleChange} className="w-full border p-2" placeholder="City" />
                        <input name="address.postalCode" value={userData.address?.postalCode || ''} onChange={handleChange} className="w-full border p-2" placeholder="Postal Code" />
                    </>
                )}

                <button type="submit" className="w-full bg-red-700 text-white py-2 rounded hover:bg-red-800">
                    Save changes
                </button>
                <div className="mt-6">
                    <h3 className="text-lg font-bold">Change password</h3>
                    <input
                        type="password"
                        placeholder="Current password"
                        className="mt-2 w-full border px-3 py-2 rounded"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="New password"
                        className="mt-2 w-full border px-3 py-2 rounded"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={handlePasswordChange}
                        className="mt-2 bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
                    >
                        Change Password
                    </button>
                    {passwordChangeMessage && <p className="mt-2 text-sm">{passwordChangeMessage}</p>}
                </div>
                {!userData?.spaceProvider && (
                    <div ref={upgradeRef} className="bg-yellow-100 border border-yellow-300 p-4 rounded mb-6">
                        <h3 className="text-lg font-semibold mb-2">Become a Space Provider</h3>
                        <p className="text-sm text-gray-700 mb-4">
                            To list and manage your own spaces, upgrade your account to a space provider.
                        </p>
                        <input
                            type="text"
                            value={userData.iban || ''}
                            onChange={(e) => setUserData((prev: any) => ({ ...prev, iban: e.target.value }))}
                            placeholder="IBAN"
                            className="mb-2 w-full p-2 border rounded"
                        />

                        <input
                            type="text"
                            value={userData.address?.street || ''}
                            onChange={(e) => setUserData((prev: any) => ({
                                ...prev,
                                address: {
                                    ...prev.address,
                                    street: e.target.value,
                                }
                            }))}
                            placeholder="Street"
                            className="mb-2 w-full p-2 border rounded"
                        />

                        <input
                            type="text"
                            value={userData.address?.city || ''}
                            onChange={(e) => setUserData((prev: any) => ({
                                ...prev,
                                address: {
                                    ...prev.address,
                                    city: e.target.value,
                                }
                            }))}
                            placeholder="City"
                            className="mb-2 w-full p-2 border rounded"
                        />

                        <input
                            type="text"
                            value={userData.address?.postalCode || ''}
                            onChange={(e) => setUserData((prev: any) => ({
                                ...prev,
                                address: {
                                    ...prev.address,
                                    postalCode: e.target.value,
                                }
                            }))}
                            placeholder="Postal Code"
                            className="mb-4 w-full p-2 border rounded"
                        />
                        <p className="text-sm text-gray-700 mb-3">
                            Necessary Information for correct processing.
                        </p>
                        <button
                            onClick={handleUpgradeToProvider}
                            disabled={!isUpgradeValid}
                            className={`w-full py-2 rounded text-white transition ${
                                isUpgradeValid ? 'bg-red-700 hover:bg-red-800' : 'bg-gray-400 cursor-not-allowed'
                            }`}
                        >
                            Upgrade Now
                        </button>
                    </div>
                )}
                <div className="mt-10 border-t pt-4">
                    <h3 className="text-lg font-bold text-red-700">Delete Account</h3>
                    <p className="text-sm mt-1 text-gray-600">Account deletion cannot be reverted.</p>
                    {!showConfirm ? (
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="mt-2 text-red-700 hover:underline"
                        >
                            Delete Account
                        </button>
                    ) : (
                        <div className="mt-2">
                            <p className="text-sm">Are you sure?</p>
                            <button
                                onClick={handleDeleteAccount}
                                className="bg-red-700 text-white px-4 py-2 rounded mr-2 hover:bg-red-800"
                            >
                                Yes, delete my account.
                            </button>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="text-gray-600 underline"
                            >
                                No, keep my account.
                            </button>
                        </div>
                    )}
                    {deletionMessage && <p className="mt-2 text-sm">{deletionMessage}</p>}
                </div>
            </form>

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

export default ProfilePage;
