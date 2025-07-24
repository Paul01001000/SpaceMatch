import express from "express";
import {createReview, findReviewsBySpaceId, getAllReviews} from "../controllers/reviewController";
import {authenticateToken} from "../controllers/auth";

const router = express.Router();
router.get('/',getAllReviews);
router.get('/space/:spaceId',findReviewsBySpaceId);
router.post('/', authenticateToken, createReview)
export default router;