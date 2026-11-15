import { Router, Response } from 'express';
import { Routine, RoutineCompletion, AuditLog } from '../models/index.js';
import { authenticate, AuthRequest, requireProfileAccess } from '../middleware/auth.js';

const router = Router();

// GET /profiles/:profileId/routines
router.get('/:profileId/routines', authenticate, requireProfileAccess(), async (req: AuthRequest, res: Response) => {
  try {
    const routines = await Routine.find({ careProfile: req.params.profileId, isActive: true });

    // Also get today's completions
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const completions = await RoutineCompletion.find({
      careProfile: req.params.profileId,
      completedAt: { $gte: startOfDay },
    });

    const completionMap: Record<string, any> = {};
    completions.forEach((c) => {
      completionMap[c.routine.toString()] = c;
    });

    const enriched = routines.map((r) => ({
      ...r.toObject(),
      todayCompleted: !!completionMap[r._id.toString()],
      completedAt: completionMap[r._id.toString()]?.completedAt,
    }));

    res.json({ routines: enriched });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch routines' });
  }
});

// POST /profiles/:profileId/routines
router.post('/:profileId/routines', authenticate, requireProfileAccess(), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, scheduleTimes, daysOfWeek } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Routine title is required.' });
    }

    const cleanTimes = Array.isArray(scheduleTimes) && scheduleTimes.length > 0
      ? scheduleTimes.filter((t: any) => typeof t === 'string' && t.trim() !== '')
      : ['08:00'];

    const routine = new Routine({
      careProfile: req.params.profileId,
      title: title.trim(),
      description: description || '',
      category: category || 'hydration',
      scheduleTimes: cleanTimes.length > 0 ? cleanTimes : ['08:00'],
      daysOfWeek,
    });

    await routine.save();

    res.status(201).json({ routine });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create routine' });
  }
});

// POST /routines/complete/:id
router.post('/complete/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const routine = await Routine.findById(req.params.id);
    if (!routine) {
      return res.status(404).json({ error: 'Routine not found' });
    }

    const completion = new RoutineCompletion({
      careProfile: routine.careProfile,
      routine: routine._id,
      completedBy: req.user._id,
      notes: req.body.notes,
      completedAt: new Date(),
    });

    await completion.save();

    res.json({ message: 'Routine marked as completed', completion });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to complete routine' });
  }
});

export default router;
