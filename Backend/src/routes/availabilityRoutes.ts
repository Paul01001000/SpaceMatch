import express from 'express';
import {
  getAvailabilitiyById,
  getAvailabilitiesBySpaceId,
  createAvailabilities,
  deleteAvailability
} from '../controllers/availabilityController';

const router = express.Router();

// GET /api/availabilities/:id - Get single availability by ID
router.get('/:id', getAvailabilitiyById);

// GET /api/availabilities/space/:spaceId - Get all availabilities by space ID
router.get('/space/:spaceId', getAvailabilitiesBySpaceId);

// POST /api/availabilities - Create new availability
router.post('/', createAvailabilities);

// PUT /api/availabilities/:id - Update availability
//router.put('/:id', updateAvailability);

// DELETE /api/availabilities/:id - Delete availability
router.delete('/:id', deleteAvailability);

export default router;