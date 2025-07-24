import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Space } from './types/Space';
import { Promotion } from './types/Promotion';
import { Booking } from './types/Booking';

import SpaceForm from './components/SpaceForm';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from "./components/LandingPage";
import SpaceManagement from './components/SpaceManagement';
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import ProfilePage from "./components/ProfilePage";
import ForgotPasswordForm from "./components/ForgotPasswordForm";
import ResetPasswordForm from "./components/ResetPasswordForm";
import {useAuth} from "./hooks/useAuth";
import VerifyEmailStatus from "./components/EmailVerification";
import StripePayment from './components/StripePayment';
import SpacePromotion from './components/SpacePromotion';
import CompletePromotion from './components/CompletePromotion';
import SearchResults from './components/SearchResults';
import SpaceDetailPage from './components/SpaceDetailPage';
import RequireProvider from "./components/RequireProvider";
import Manage from './components/Manage';
import MyBookings from './components/MyBookings';
import MySpaces from './components/MySpaces';
import MyReviews from './components/MyReviews';
import MyReservations from './components/MyReservations';
import Chat from './components/Chat';
import CompleteBooking from './components/CompleteBooking';
import { useChat } from './hooks/useChat';
import ProtectedRoute from "./components/ProtectedRoute";
import { DivideIcon } from '@heroicons/react/24/solid';


// Main App component
function App() {
  const navigate = useNavigate();
  const [promotionStorage, setPromotionStorage] = useState<Promotion | null>(null);
  const [bookingStorage, setBookingStorage] = useState<Booking | null>(null);
  const { setUser, user } = useAuth(); // <-- get user from useAuth
  const { isOpen: isChatOpen, openChat, closeChat, currentBookingId } = useChat();

  const handleSave = (space: Space) => {
    console.log('Space saved:', space);
    // Note: Success notification and navigation are now handled in SpaceForm component
    // Don't navigate immediately to let the notification show
  };

  const handleSavePromotion = (promotion: Promotion) => {
    console.log('Promotion saved:', promotion);
    setPromotionStorage(promotion);
    navigate('/promote/payment');
  };

  const handleSaveBooking = (booking: Booking) => {
    console.log('Booking saved:', booking);
    setBookingStorage(booking);
    navigate('/booking/payment');
  };

  return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header
            toLanding={() => navigate('/')}
            onLogin={() => navigate('/login')}
            onRegister={() => navigate('/register')}
            onProfile={() => navigate('/profile')}
        />
        
        <main className="flex-1 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full">
          <Routes>
            <Route path="/" element={<div className="flex flex-col w-full"><LandingPage setView={navigate} /></div>} />

              <Route path="/search" element={<SearchResults />} />

              <Route path="/spaces/:id" element={<SpaceDetailPage onSave={handleSaveBooking} />} />

            <Route
                path="/create"
                element={
                  <RequireProvider>
                    <SpaceForm onSave={handleSave} onCancel={() => navigate('/my-spaces')} />
                  </RequireProvider>
                }
            />

            <Route
                path="/edit/:id"
                element={
                  <RequireProvider>
                    <SpaceForm onSave={handleSave} onCancel={() => navigate('/my-spaces')} />
                  </RequireProvider>
                }
            />

            <Route
                path="/manage/:id"
                element={
                  <RequireProvider>
                    <SpaceManagement onCancel={() => navigate('/my-spaces')} />
                  </RequireProvider>
                }
            />

            <Route
                path="/manage"
                element={
                    <RequireProvider>
                        <Manage />
                    </RequireProvider>
                }
            />

            <Route
                path="/promote/:id"
                element={
                    <RequireProvider>
                        <SpacePromotion onSave={handleSavePromotion} onCancel={() => navigate('/my-spaces')} />
                    </RequireProvider>
                }
            />

            <Route
                path="/my-bookings"
                element={
                    <ProtectedRoute>
                        <MyBookings onOpenChat={openChat} onPaymentContinue={handleSaveBooking} />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/my-spaces"
                element={
                    <RequireProvider>
                        <MySpaces />
                    </RequireProvider>
                }
            />

            <Route
                path="/my-reviews"
                element={
                    <RequireProvider>
                        <MyReviews />
                    </RequireProvider>
                }
            />

            <Route
                path="/my-reservations"
                element={
                    <RequireProvider>
                        <MyReservations />
                    </RequireProvider>
                }
            />

            <Route
                path="/promote/payment"
                element={
                    <RequireProvider>
                        <StripePayment promotionData={promotionStorage} />
                    </RequireProvider>
                }
            />

            <Route
                path="/booking/payment"
                element={
                      <StripePayment bookingData={bookingStorage} />
                }
            />

            <Route
                path="/promotion/completed"
                element={
                    <RequireProvider>
                        <CompletePromotion onReturn={() => navigate('/my-spaces')}/>
                    </RequireProvider>
                }
            />

            <Route
                path="/booking/completed"
                element={
                  <CompleteBooking onReturn={() => navigate('/my-bookings')}/>
                }
            />

            {/* Authentication Routes */}

            <Route path="/login" element={<LoginForm
                onSuccess={(user) => {
                  setUser(user);
                  navigate('/');
                }}
                onRegister={() => navigate('/register')}
                onForgotPassword={() => navigate('/forgot-password')}
            />}
            />

            <Route path="/register" element={<RegisterForm onLogin={() => navigate('/login')} />} />

            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <ProfilePage token={localStorage.getItem('token') || ''} setCurrentView={navigate} />
                    </ProtectedRoute>
                }
            />

            <Route path="/forgot-password" element={<ForgotPasswordForm />} />

            <Route path="/reset-password/:token" element={<ResetPasswordForm />} />

            <Route path="/verify-email-status" element={<VerifyEmailStatus />} />

          </Routes>
        </main>

        <Footer />

        {/* Chat Component */}
        {isChatOpen && currentBookingId && user && (
          <Chat
            bookingId={currentBookingId}
            currentUserId={user.id}
            onClose={closeChat}
          />
        )}
      </div>
  );
}

export default App;