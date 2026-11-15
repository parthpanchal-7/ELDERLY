import { Router, Response } from 'express';
import { AuditLog } from '../models/index.js';
import { authenticate, AuthRequest, requireProfileAccess } from '../middleware/auth.js';

const router = Router();

// GET /profiles/:profileId/audit-logs
router.get('/:profileId/audit-logs', authenticate, requireProfileAccess(), async (req: AuthRequest, res: Response) => {
  try {
    const logs = await AuditLog.find({
      $or: [
        { careProfile: req.params.profileId },
        { targetEntityId: req.params.profileId },
      ],
    })
      .populate('actor', 'displayName email primaryRole')
      .sort({ timestamp: -1 })
      .limit(100);

    res.json({ auditLogs: logs });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch audit logs' });
  }
});

export default router;
