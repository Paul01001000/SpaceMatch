import { useState, useEffect } from "react";
import ReservationsList from './ReservationsList';
import Chat from './Chat';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../hooks/useAuth';
import { useUnreadChats } from '../hooks/useUnreadChats';
import { spaceService } from '../services/spaceService';
import { reservationService } from '../services/reservationService';
import { Booking } from '../types/Booking';

const MyReservations = () => {
    const { isOpen, openChat, closeChat, currentBookingId } = useChat();
    const { user } = useAuth();
    const [allReservations, setAllReservations] = useState<Booking[]>([]);

    // Get all booking IDs for unread chat checking
    const bookingIds = allReservations.map(booking => booking._id).filter(Boolean);
    const { hasAnyUnread, totalUnread } = useUnreadChats(bookingIds);

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

    return (
        <div className="my-reservations mt-8">
            <ReservationsList onOpenChat={openChat} />

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
};

export default MyReservations;
