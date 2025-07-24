//The manage tab in the header, which will contain, My spaces, Reviews, Space Reservations etc
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import SpaceList from "./SpaceList";
import Reviews from "./Reviews";
import ReservationsList from './ReservationsList';
import Chat from './Chat';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../hooks/useAuth';
import { useUnreadChats } from '../hooks/useUnreadChats';
import { spaceService } from '../services/spaceService';
import { reservationService } from '../services/reservationService';
import { Booking } from '../types/Booking';

const Manage = () => {
    const [searchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') as 'spaces' | 'reviews' | 'reservations' || 'spaces';
    const [activeTab, setActiveTab] = useState<'spaces' | 'reviews' | 'reservations'>(initialTab);
    const navigate = useNavigate();
    const { isOpen, openChat, closeChat, currentBookingId } = useChat();
    const { user } = useAuth();
    const [allReservations, setAllReservations] = useState<Booking[]>([]);

    // Get all booking IDs for unread chat checking
    const bookingIds = allReservations.map(booking => booking._id).filter(Boolean);
    const { hasAnyUnread, totalUnread } = useUnreadChats(bookingIds);

    // Update active tab when URL params change
    useEffect(() => {
        const tabFromUrl = searchParams.get('tab') as 'spaces' | 'reviews' | 'reservations';
        if (tabFromUrl && ['spaces', 'reviews', 'reservations'].includes(tabFromUrl)) {
            setActiveTab(tabFromUrl);
        }
    }, [searchParams]);

    // Fetch reservations for unread checking
    useEffect(() => {
        const fetchAllReservations = async () => {
            try {
                const spaces = await spaceService.getMySpaces();
                const allBookings: Booking[] = [];
                
                for (const space of spaces) {
                    const reservations = await reservationService.getReservationsBySpaceId(space._id);
                    allBookings.push(...reservations);
                }
                
                setAllReservations(allBookings);
            } catch (error) {
                console.error('Error fetching reservations for unread checking:', error);
            }
        };

        if (user) {
            fetchAllReservations();
        }
    }, [user]);

    // Handlers for SpaceList actions
    const handleEditSpace = (spaceId: string) => {
        navigate(`/edit/${spaceId}`);
    };
    const handleManageSpace = (spaceId: string) => {
        navigate(`/manage/${spaceId}`);
    };
    const handleCreateSpace = () => {
        navigate('/create');
    };
    const handlePromoteSpace = (spaceId: string) => {
        navigate(`/promote/${spaceId}`);
    };

    return (
        <div className="manage">
            <div className="flex justify-center gap-20 border-b mb-8">
                <button
                    className={`px-6 py-3 text-lg font-semibold text-gray-700 border-b-2 transition ${activeTab === 'spaces' ? 'border-red-500 text-red-600' : 'border-transparent hover:text-red-600 hover:border-red-500'}`}
                    onClick={() => setActiveTab('spaces')}
                >
                    My Spaces
                </button>
                <button
                    className={`px-6 py-3 text-lg font-semibold text-gray-700 border-b-2 transition ${activeTab === 'reviews' ? 'border-red-500 text-red-600' : 'border-transparent hover:text-red-600 hover:border-red-500'}`}
                    onClick={() => setActiveTab('reviews')}
                >
                    Reviews
                </button>
                <button
                    className={`px-6 py-3 text-lg font-semibold text-gray-700 border-b-2 transition relative ${activeTab === 'reservations' ? 'border-red-500 text-red-600' : 'border-transparent hover:text-red-600 hover:border-red-500'}`}
                    onClick={() => setActiveTab('reservations')}
                >
                    Reservations
                    {hasAnyUnread && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                            {totalUnread > 9 ? '9+' : totalUnread}
                        </span>
                    )}
                </button>
            </div>

            <div>
                {activeTab === 'spaces' && (
                    <SpaceList
                        onEditSpace={handleEditSpace}
                        onManageSpace={handleManageSpace}
                        onCreateSpace={handleCreateSpace}
                        onPromoteSpace={handlePromoteSpace}
                    />
                )}

                {activeTab === 'reviews' && <Reviews />}
                {activeTab === 'reservations' && <ReservationsList onOpenChat={openChat} />}
            </div>

            {/* Chat Modal */}
            {isOpen && currentBookingId && user && (
                <Chat 
                    bookingId={currentBookingId}
                    currentUserId={user.id}
                    onClose={closeChat}
                />
            )}
        </div>
    );
}

export default Manage;