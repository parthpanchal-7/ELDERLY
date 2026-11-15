import { Router, Response } from 'express';
import { Notification, NotificationPreference, CareProfile, PushSubscription } from '../models/index.js';
import { authenticate, AuthRequest, requireProfileAccess } from '../middleware/auth.js';
import { sendEmail, buildDoseReminderEmail } from '../utils/email.js';
import { sendWebPush } from '../utils/push.js';

const router = Router();

// GET /profiles/:profileId/notifications
router.get('/:profileId/notifications', authenticate, requireProfileAccess(), async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await Notification.find({
      careProfile: req.params.profileId,
      recipientUser: req.user._id,
    }).sort({ createdAt: -1 }).limit(50);

    const unreadCount = await Notification.countDocuments({
      careProfile: req.params.profileId,
      recipientUser: req.user._id,
      status: { $ne: 'read' },
    });

    res.json({ notifications, unreadCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch notifications' });
  }
});

// PUT /notifications/read/:id
router.put('/read/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    notification.status = 'read';
    notification.readAt = new Date();
    await notification.save();

    res.json({ message: 'Notification marked as read', notification });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update notification' });
  }
});

// PUT /notifications/read-all/:profileId
router.put('/read-all/:profileId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await Notification.updateMany(
      {
        careProfile: req.params.profileId,
        recipientUser: req.user._id,
        status: { $ne: 'read' },
      },
      {
        $set: { status: 'read', readAt: new Date() },
      }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update notifications' });
  }
});

// POST /notifications/test (Sends a real test notification via email/in-app)
router.post('/test', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { careProfileId, channel } = req.body;
    const profile = careProfileId ? await CareProfile.findById(careProfileId) : null;
    const profileName = profile?.fullName || 'Elderly Patient';

    const notif = new Notification({
      careProfile: careProfileId || req.user._id,
      recipientUser: req.user._id,
      title: 'SaathiCare Test Notification',
      message: 'This is a test notification confirming your care reminders and escalation channels are working!',
      type: 'general',
      channel: channel || 'in_app',
      status: 'delivered',
      sentAt: new Date(),
    });
    await notif.save();

    let emailSent = false;
    if (channel === 'email' || req.user.email) {
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const emailContent = buildDoseReminderEmail(req.user.displayName, 'Scheduled Medication', currentTime);
      const result = await sendEmail({
        to: req.user.email,
        subject: 'SaathiCare: Care Notification',
        html: emailContent.html,
      });
      emailSent = result.success;
    }

    let pushSent = false;
    try {
      const subs = await PushSubscription.find({ user: req.user._id });
      for (const sub of subs) {
        const sent = await sendWebPush(sub, {
          title: 'SaathiCare Notification',
          body: notif.message,
        });
        if (sent) pushSent = true;
      }
    } catch {
      // Non-blocking
    }

    res.json({
      message: 'Test notification processed',
      notification: notif,
      emailSent,
      pushSent,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to send test notification' });
  }
});

// POST /notifications/push/subscribe (Registers browser web-push subscription)
router.post('/push/subscribe', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ error: 'Invalid push subscription payload' });
    }

    const existing = await PushSubscription.findOne({ endpoint });
    if (existing) {
      existing.user = req.user._id;
      existing.keys = keys;
      await existing.save();
      return res.json({ message: 'Push subscription updated' });
    }

    await PushSubscription.create({
      user: req.user._id,
      endpoint,
      keys,
    });

    res.status(201).json({ message: 'Push subscription registered successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to register push subscription' });
  }
});

// GET /profiles/:profileId/notification-preferences
router.get('/:profileId/notification-preferences', authenticate, requireProfileAccess(), async (req: AuthRequest, res: Response) => {
  try {
    let pref = await NotificationPreference.findOne({
      careProfile: req.params.profileId,
      user: req.user._id,
    });

    if (!pref) {
      pref = new NotificationPreference({
        careProfile: req.params.profileId,
        user: req.user._id,
        pushEnabled: true,
        smsEnabled: false,
        emailEnabled: true,
      });
      await pref.save();
    }

    res.json({ preferences: pref });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch preferences' });
  }
});

// PUT /profiles/:profileId/notification-preferences
router.put('/:profileId/notification-preferences', authenticate, requireProfileAccess(), async (req: AuthRequest, res: Response) => {
  try {
    let pref = await NotificationPreference.findOne({
      careProfile: req.params.profileId,
      user: req.user._id,
    });

    if (!pref) {
      pref = new NotificationPreference({
        careProfile: req.params.profileId,
        user: req.user._id,
      });
    }

    const fields = ['pushEnabled', 'smsEnabled', 'emailEnabled', 'phoneForSms', 'emailAddress', 'quietHoursStart', 'quietHoursEnd', 'quietHoursEnabled'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        (pref as any)[f] = req.body[f];
      }
    });

    await pref.save();
    res.json({ preferences: pref });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update preferences' });
  }
});

export default router;
