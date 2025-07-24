import React,{ useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import defaultUserIcon from '../assets/user.svg'; // ← dein Fallback-Bild
import { useNavigate, useLocation } from 'react-router-dom';
import { reservationService } from '../services/reservationService';
import { spaceService } from '../services/spaceService';
import BookingCard from './BookingCard';
import { Booking } from '../types/Booking';
import { Space } from '../types/Space';

interface HeaderProps {
    toLanding: () => void;
    onLogin: () => void;
    onRegister: () => void;
    onProfile: () => void;
}


const Header: React.FC<HeaderProps> = ({
                                           toLanding,
                                           onLogin,
                                           onRegister,
                                           onProfile
                                       }) => {
    const { user, logout } = useAuth();
    const isAuthenticated = !!user;
    const navigate = useNavigate();
    const location = useLocation();
    const [isProviderMode, setIsProviderMode] = useState(false);

    // Modal state
    const [showBookings, setShowBookings] = useState(false);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [spaces, setSpaces] = useState<{ [spaceId: string]: Space }>({});
    const [loading, setLoading] = useState(false);

    // Fetch bookings and spaces when modal opens
    useEffect(() => {
        if (showBookings && user?.id) {
            setLoading(true);
            reservationService.getReservationsByUserId(user.id)
                .then(async (res) => {
                    setBookings(res);
                    // Fetch all unique spaces
                    const uniqueSpaceIds = Array.from(new Set(res.map(b => b.spaceId)));
                    const spaceResults = await Promise.all(uniqueSpaceIds.map(id => spaceService.getSpaceById(id)));
                    const spaceMap: { [spaceId: string]: Space } = {};
                    spaceResults.forEach(space => { if (space._id) spaceMap[space._id] = space; });
                    setSpaces(spaceMap);
                })
                .finally(() => setLoading(false));
        }
    }, [showBookings, user]);

    // Group bookings
    const now = new Date();
    const pastBookings = bookings.filter(b => new Date(b.endTime) < now);
    const futureBookings = bookings.filter(b => new Date(b.endTime) >= now);

    const handleLogout = () => {
        logout();       // clear auth
        toLanding();    // redirect to landing page
    };

    // Navigation handlers
    const handleSearch = () => {
        navigate('/search');
    };

    const handleMyBookings = () => {
        navigate('/my-bookings');
    };

    const handleListProperty = () => {
        if (user?.spaceProvider) {
            navigate('/create');
        } else {
            // Redirect to become provider flow
            navigate('/create'); // This should handle non-provider users
        }
    };

    const handleMySpaces = () => {
        navigate('/my-spaces');
    };

    const handleReviews = () => {
        navigate('/my-reviews');
    };

    const handleReservations = () => {
        navigate('/my-reservations');
    };

    // Helper function to get button styling based on current route
    const getButtonStyle = (routePath: string) => {
        const isActive = location.pathname === routePath;
        return isActive 
            ? "text-lg px-4 py-2 rounded-full font-bold text-white bg-red-700 border-2 border-red-800 transition"
            : "text-lg px-4 py-2 rounded-full font-bold text-gray-700 hover:bg-gray-200 border-2 border-black transition";
    };

    return (
        <header className="flex justify-between items-center p-4 border-b shadow">
            <div onClick={toLanding} className="cursor-pointer">
                <h1 className="text-3xl font-bold italic font-serif text-red-800">SpaceMatch</h1>
                <p className="text-m font-bold text-gray-600 mt-1">Rent & List - All in One Place</p>
            </div>
            <div className="flex items-center gap-8">
                {/* Navigation based on login status and mode */}
                {isAuthenticated ? (
                    <>
                        {/* Navigation items based on mode */}
                        {!isProviderMode ? (
                            // User mode navigation
                            <>
                                <button
                                    className={getButtonStyle('/search')}
                                    onClick={handleSearch}
                                >
                                    Search
                                </button>
                                <button
                                    className={getButtonStyle('/my-bookings')}
                                    onClick={handleMyBookings}
                                >
                                    My Bookings
                                </button>
                                {!user?.spaceProvider && (
                                    <button
                                        className={getButtonStyle('/create')}
                                        onClick={handleListProperty}
                                    >
                                        List Your Property
                                    </button>
                                )}
                            </>
                        ) : (
                            // Provider mode navigation
                            <>
                                <button
                                    className={getButtonStyle('/my-spaces')}
                                    onClick={handleMySpaces}
                                >
                                    My Spaces
                                </button>
                                <button
                                    className={getButtonStyle('/my-reviews')}
                                    onClick={handleReviews}
                                >
                                    Reviews
                                </button>
                                <button
                                    className={getButtonStyle('/my-reservations')}
                                    onClick={handleReservations}
                                >
                                    Reservations
                                </button>
                            </>
                        )}
                    </>
                ) : null}

                {/* User account section */}
                {isAuthenticated ? (
                <div className="flex items-center gap-4">
                    {/* Show mode switch if user is a space provider - moved before welcome message */}
                    {user?.spaceProvider && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">User</span>
                            <label className="relative inline-block w-12 h-6">
                                <input
                                    type="checkbox"
                                    checked={isProviderMode}
                                    onChange={(e) => setIsProviderMode(e.target.checked)}
                                    className="sr-only"
                                />
                                <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition ${
                                    isProviderMode ? 'bg-red-700' : 'bg-gray-300'
                                }`}>
                                    <span className={`absolute w-5 h-5 bg-white rounded-full transition transform ${
                                        isProviderMode ? 'translate-x-6' : 'translate-x-0.5'
                                    } top-0.5`}></span>
                                </span>
                            </label>
                            <span className="text-sm text-gray-600">Provider</span>
                        </div>
                    )}

                    <span className="text-gray-800 font-medium italic">
                        Welcome {user?.firstName || 'User'}!
                    </span>

                    <img
                        src={user?.profilePicture?.startsWith('data:image') ? user.profilePicture : defaultUserIcon}

                        alt="Profil"
                        onClick={onProfile}
                        className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-gray-300 hover:border-red-500 transition"
                    />
                    <button onClick={handleLogout} className="border-2 border-black rounded-full px-4 py-2 text-black hover:bg-gray-200 transition">Logout</button>
                </div>
            ) : (
                <div className="flex gap-4">
                    <button onClick={onLogin} className="bg-red-700 text-white border rounded-full px-4 py-2 transition">Login</button>
                    <button onClick={onRegister} className="bg-white text-black border-1 border-black rounded-full px-4 py-2 transition">Register</button>
                </div>
            )}
        </div>
        </header>
    );
};

export default Header;