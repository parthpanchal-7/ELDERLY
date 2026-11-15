import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/crypto.js';
import { User, CareProfile, CareCircleMembership } from '../models/index.js';

export interface AuthRequest extends Request {
  user?: any;
  careProfile?: any;
  membership?: any;
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required. No token provided.' });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User account not found or deactivated.' });
    }

    req.user = user;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.primaryRole)) {
      return res.status(403).json({
        error: `Forbidden: requires one of the following roles: ${allowedRoles.join(', ')}`,
      });
    }
    next();
  };
}

export function requireProfileAccess(requiredPermission?: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const profileId = req.params.profileId || req.params.id || req.body.careProfileId;
      if (!profileId) {
        return res.status(400).json({ error: 'careProfile ID is required.' });
      }

      const profile = await CareProfile.findById(profileId);
      if (!profile) {
        return res.status(404).json({ error: 'Care profile not found.' });
      }

      // Check if user is owner
      if (profile.owner.toString() === req.user._id.toString()) {
        req.careProfile = profile;
        return next();
      }

      // Otherwise check CareCircleMembership
      const membership = await CareCircleMembership.findOne({
        careProfile: profile._id,
        user: req.user._id,
        status: 'active',
      });

      if (!membership) {
        return res.status(403).json({
          error: 'Forbidden: You do not have access to this care circle.',
        });
      }

      if (requiredPermission) {
        const perms: any = membership.permissions;
        if (!perms || !perms[requiredPermission]) {
          return res.status(403).json({
            error: `Forbidden: Missing permission "${requiredPermission}" for this care profile.`,
          });
        }
      }

      req.careProfile = profile;
      req.membership = membership;
      next();
    } catch (err: any) {
      return res.status(500).json({ error: 'Authorization verification failed.' });
    }
  };
}
