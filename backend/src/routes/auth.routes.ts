import { Router, Request, Response } from 'express';
import { User, AuditLog } from '../models/index.js';
import { hashPassword, comparePassword, generateToken, generateRefreshToken } from '../utils/crypto.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// POST /auth/register
router.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password, displayName, primaryRole, phone } = req.body;

    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'Email, password, and display name are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await hashPassword(password);
    const user = new User({
      email: email.toLowerCase(),
      passwordHash,
      displayName,
      phone,
      primaryRole: primaryRole || 'profile_owner',
      isEmailVerified: true, // simplified for hackathon
    });

    await user.save();

    await AuditLog.create({
      actor: user._id,
      action: 'LOGIN',
      targetEntity: 'User',
      targetEntityId: user._id.toString(),
      details: { event: 'registration' },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const token = generateToken({ id: user._id, role: user.primaryRole });
    const refreshToken = generateRefreshToken({ id: user._id });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userObj = user.toObject();
    delete userObj.passwordHash;

    res.status(201).json({
      message: 'Account created successfully',
      user: userObj,
      token,
      refreshToken,
    });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message || 'Registration failed.' });
  }
});

// POST /auth/login
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    user.lastLoginAt = new Date();
    await user.save();

    await AuditLog.create({
      actor: user._id,
      action: 'LOGIN',
      targetEntity: 'User',
      targetEntityId: user._id.toString(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const token = generateToken({ id: user._id, role: user.primaryRole });
    const refreshToken = generateRefreshToken({ id: user._id });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userObj = user.toObject();
    delete userObj.passwordHash;

    res.json({
      message: 'Signed in successfully',
      user: userObj,
      token,
      refreshToken,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Sign in failed.' });
  }
});

// POST /auth/google
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { email, name, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Valid email is required for Google authentication.' });
    }

    const targetEmail = email.toLowerCase().trim();
    const targetName = (name || email.split('@')[0]).trim();

    let user = await User.findOne({ email: targetEmail });
    if (!user) {
      user = new User({
        email: targetEmail,
        displayName: targetName,
        primaryRole: role || 'profile_owner',
        isEmailVerified: true,
        googleId: 'google_' + Date.now(),
      });
      await user.save();
    }

    const token = generateToken({ id: user._id, role: user.primaryRole });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userObj = user.toObject();
    delete userObj.passwordHash;

    res.json({
      message: 'Signed in with Google',
      user: userObj,
      token,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Google authentication failed' });
  }
});

// GET /auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

// POST /auth/logout
router.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Signed out successfully' });
});

export default router;
