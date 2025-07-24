// middleware/checkOwnership.ts
import { Request, Response, NextFunction } from 'express';
import { Model } from 'mongoose';
import { AuthenticatedRequest } from '../controllers/auth'; // your custom type with userId

export const checkOwnership = (
    model: Model<any>,
    paramIdKey: string,
    ownerField: string
) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const resourceId = req.params[paramIdKey];
            const userId = req.userId;

            const resource = await model.findById(resourceId);

            if (!resource) {
                res.status(404).json({ message: 'Resource not found' });
                return;
            }

            if (resource[ownerField]?.toString() !== userId?.toString()) {
                res.status(403).json({ message: 'Forbidden: Not owner of resource' });
                return;
            }

            next(); // ✅ Proceed to controller
        } catch (error) {
            console.error('Ownership check failed:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };
};
