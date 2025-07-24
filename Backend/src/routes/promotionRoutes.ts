import express from 'express';
import {
    getAllPromotions,
    getPromotionById,
    getPromotionBySpaceId,
    createPromotion,
    deletePromotion,
    confirmPromotion
} from '../controllers/promotionController';
import { authenticateToken } from '../controllers/auth';


const router = express.Router();

// GET /api/promotions - Get all promotions
router.get('/', getAllPromotions);  

// GET /api/promotions/:id - Get single promotion
router.get('/:id', getPromotionById);

// GET /api/promotions/space/:spaceId - Get all promotions by space ID
router.get('/space/:spaceId', getPromotionBySpaceId);

// POST /api/promotions - Create new promotion
router.post('/', authenticateToken, createPromotion);

// DELETE /api/promotions/:id - Delete promotion
router.delete('/:id', deletePromotion);

// Confirm promotion
router.put('/:id/confirm', authenticateToken, confirmPromotion);

export default router;