import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { authenticateToken, AuthenticatedRequest } from '../controllers/auth';
import crypto from 'crypto';
import {
    sendPasswordResetEmail,
    sendVerificationEmail,
    sendPasswordChangeNotification,
    sendAccountDeletionNotification
} from '../controllers/mailer';
import { isPasswordStrong } from '../controllers/validatePassword';

dotenv.config();

const router = express.Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            spaceProvider,
            iban,
            address
        } = req.body;

        if (!firstName || !lastName || !email || !password) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        const existingUser = await User.findOne({ email });
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const userData = {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            spaceProvider: !!spaceProvider,
            ...(spaceProvider && {
                iban,
                address
            }),
            registration: new Date(),
            deletedAt: undefined, // bei Reaktivierung explizit zurücksetzen
            emailVerificationToken: verificationToken,
            emailVerificationExpires: tokenExpires,
        };

        let user;
        let reactivated = false;

        if (existingUser) {
            if (!existingUser.deletedAt) {
                // Aktiver User vorhanden → Fehler
                res.status(409).json({ message: 'User already exists' });
                return;
            }

            // Reaktivierung
            Object.assign(existingUser, userData);
            user = await existingUser.save();
            reactivated = true;
        } else {
            // Neue Registrierung
            user = new User(userData);
            await user.save();
        }

        await sendVerificationEmail(user.email, user.firstName, verificationToken);

        res.status(201).json({
            message: reactivated ? 'Account reactivated successfully' : 'User registered successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
        return;
    }
});

router.get('/verify-email', async (req: Request, res: Response): Promise<void> => {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
        res.redirect(`${process.env.FRONTEND_URL}/verify-email-status?status=failure`);
        return;
    }

    try {
        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: new Date() }
        });

        if (!user) {
            res.redirect(`${process.env.FRONTEND_URL}/verify-email-status?status=failure`);
            return;
        }

        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        return res.redirect(`${process.env.FRONTEND_URL}/verify-email-status?status=success`);

    } catch (error) {
        console.error('Error verifying email:', error);
        return res.redirect(`${process.env.FRONTEND_URL}/verify-email-status?status=failure`);
    }
});


router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || user.deletedAt) {
            res.status(400).json({ message: 'A User with this E-Mail does not exist' });
            return;
        }

        if (!user.emailVerified) {
            res.status(403).json({ message: 'Email not verified. Please check your inbox.' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Incorrect Password' });
            return;
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, {
            expiresIn: '1h',
        });

        res.status(200).json({ token, userId: user._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const user = await User.findById(userId);
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }

    res.status(200).json({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        mobileNumber: user.mobileNumber,
        birthdate: user.birthdate?.toISOString().split('T')[0], // falls undefined
        bio: user.bio,
        profileImage: user.profileImage, // falls du es speicherst
        spaceProvider: user.spaceProvider,
        iban: user.iban,
        address: user.address,
        profilePicture: user.profilePicture
    });
});

router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.userId;
    const {
        firstName,
        lastName,
        bio,
        mobileNumber,
        birthdate,
        iban,
        address,
        profilePicture,
        spaceProvider,
    } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.bio = bio || user.bio;
        user.mobileNumber = mobileNumber || user.mobileNumber;
        user.birthdate = birthdate ? new Date(birthdate) : user.birthdate;
        user.profilePicture = profilePicture || user.profilePicture;

        if (spaceProvider && !user.spaceProvider) {
            if (!iban || !address?.street || !address?.city || !address?.postalCode) {
                res.status(400).json({message: 'To become a space provider, IBAN and full address are required.'});
                return;
            }

            user.iban = iban;
            user.address = address;
            user.spaceProvider = true;
        } else if (user.spaceProvider) {
            // If already provider, allow updating optional fields
            user.iban = iban || user.iban;
            user.address = address || user.address;
        }

        await user.save();

        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/request-password-reset', async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    const responseMsg = { message: 'If email exists, a reset link has been sent' };

    if (!user) {
        res.status(200).json(responseMsg);
        return;
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 60);
    await user.save();

    await sendPasswordResetEmail(user.email, rawToken);

    res.status(200).json(responseMsg);
});

router.post('/reset-password/:token', async (req: Request, res: Response): Promise<void> => {
    const {token} = req.params;
    const {newPassword} = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: {$gt: new Date()},
    });

    if (!user) {
        console.warn('❌ Kein User gefunden für Token.');
        res.status(400).json({message: 'Invalid or expired token'});
        return;
    }

// Nur wenn User existiert
    if (!isPasswordStrong(newPassword)) {
        res.status(400).json({message: 'Password must be at least 8 characters and include at least 3 of: uppercase, lowercase, number, special character.'});
        return;
    }

    try {
        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        await sendPasswordChangeNotification(user.email, user.name);
        res.status(200).json({message: 'Password successfully reset'});
    } catch (err) {
        console.error('❌ Fehler beim Speichern des Users:', err);
        res.status(500).json({message: 'Internal Server Error'});
    }
});

router.put('/change-password', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        res.status(400).json({ message: 'Current and new passwords are required' });
        return;
    }

    const user = await User.findById(req.userId);
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        res.status(401).json({ message: 'Incorrect current password' });
        return;
    }

    if (!isPasswordStrong(newPassword)) {
        res.status(400).json({ message: 'Password must be at least 8 characters and include at least 3 of: uppercase, lowercase, number, special character.' });
        return;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await sendPasswordChangeNotification(user.email, user.name);

    res.status(200).json({ message: 'Password changed successfully' });
});

router.delete('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!req.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return
        }

        const user = await User.findById(req.userId);
        if (!user || user.deletedAt) {
            res.status(404).json({message: 'User not found or already deleted'});
            return;
        }
        user.deletedAt = new Date();
        await user.save({validateBeforeSave: false});

        await sendAccountDeletionNotification(user.email, user.firstName || 'User');

        res.status(200).json({message: 'Account marked as deleted'});
        return;
    } catch (error) {
        console.error('Error in DELETE /profile:', error);
        res.status(500).json({ message: 'Internal server error' });
        return;
    }
});

export default router;
