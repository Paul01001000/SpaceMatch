import express from 'express';
import {
    createReservation,
    updateReservation,
    getReservationsBySpaceId,
    getReservationsByUserId,
    getReservationsOfProviderSpaces,
    getSpaceAvailability,
    confirmReservation
} from '../controllers/reservationController';
import { authenticateToken } from '../controllers/auth';

const router = express.Router();

// Get reservations by space ID
router.get('/space/:spaceId', getReservationsBySpaceId);
router.get('/user/:userId', getReservationsByUserId);   //To get reservations of a normal user
router.post('/', authenticateToken, createReservation)
router.put('/:reservationId', authenticateToken, updateReservation);
router.get('/provider/:providerId', getReservationsOfProviderSpaces); //To get reservations of spaces of the current provider
router.post('/check-availability', getSpaceAvailability); //To check availability of a space
// Confirm promotion
router.put('/:id/confirm', authenticateToken, confirmReservation);
export default router;
