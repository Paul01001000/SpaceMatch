import express from 'express';
import {
  getAllSpaces,
  getSpaceById,
  createSpace,
  updateSpace,
  deleteSpace,
  getSpacesByUser,
  searchSpaces,
} from '../controllers/spaceController';
import { authenticateToken } from '../controllers/auth';
import { checkOwnership } from '../controllers/checkOwnership';
import { Space } from '../models';


const router = express.Router();

// GET /api/spaces/search?postalCode=...&category=...&from=...&to=...
router.get('/search', searchSpaces);

// GET /api/spaces - Get all spaces
router.get('/', getAllSpaces);

router.get('/mine', authenticateToken, getSpacesByUser);
// GET /api/spaces/:id - Get single space
router.get('/:id', getSpaceById);

// POST /api/spaces - Create new space
router.post('/', authenticateToken, createSpace);

// PUT /api/spaces/:id - Update space
router.put('/:id', authenticateToken, checkOwnership(Space, 'id', 'providerId'), updateSpace);

// DELETE /api/spaces/:id - Delete space
router.delete('/:id', authenticateToken, checkOwnership(Space, 'id', 'providerId'), deleteSpace);


export default router;