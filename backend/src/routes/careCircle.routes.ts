import { Router, Response } from 'express';
import { CareCircleMembership, Invitation, AuditLog, CareProfile, Notification } from '../models/index.js';
import { authenticate, AuthRequest, requireProfileAccess } from '../middleware/auth.js';
import { generatePasscode, hashPasscode, comparePasscode } from '../utils/crypto.js';
import { sendEmail, buildInvitationEmail } from '../utils/email.js';

const router = Router();

// GET /care-circles/:profileId/members
router.get('/:profileId/members', authenticate, requireProfileAccess(), async (req: AuthRequest, res: Response) => {
  try {
    const members = await CareCircleMembership.find({
      careProfile: req.params.profileId,
      status: 'active',
    }).populate('user', 'displayName email phone avatarUrl primaryRole');

    res.json({ members });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch members' });
  }
});

// POST /care-circles/:profileId/invitations
router.post('/:profileId/invitations', authenticate, requireProfileAccess(), async (req: AuthRequest, res: Response) => {
  try {
    const { role, relationshipToOwner, inviteeEmail, inviteePhone, permissions } = req.body;

    if (!role || !relationshipToOwner) {
      return res.status(400).json({ error: 'Role and relationship are required.' });
    }

    const rawPasscode = generatePasscode(6);
    const passcodeHash = await hashPasscode(rawPasscode);

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const invitation = new Invitation({
      careProfile: req.careProfile._id,
      invitedBy: req.user._id,
      role,
      relationshipToOwner,
      passcodeHash,
      inviteeEmail: inviteeEmail ? inviteeEmail.toLowerCase() : undefined,
      inviteePhone,
      permissions: permissions || {
        canViewMedications: true,
        canConfirmDoses: role === 'caregiver',
        canEditMedications: false,
        canViewAppointments: true,
        canEditAppointments: false,
        canViewObservations: true,
        canAddObservations: role === 'caregiver',
        canViewDocuments: false,
        canUploadDocuments: false,
        canReceiveEscalations: true,
        canManageCareCircle: false,
        canExportData: false,
      },
      expiresAt,
    });

    await invitation.save();

    await AuditLog.create({
      careProfile: req.careProfile._id,
      actor: req.user._id,
      action: 'INVITE_SENT',
      targetEntity: 'Invitation',
      targetEntityId: invitation._id.toString(),
      details: { role, inviteeEmail, inviteePhone },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Send email notification if email provided
    if (inviteeEmail) {
      const emailContent = buildInvitationEmail(
        req.user.displayName,
        req.careProfile.fullName,
        rawPasscode,
        role
      );
      await sendEmail({
        to: inviteeEmail,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    }

    res.status(201).json({
      message: 'Invitation generated successfully',
      invitationId: invitation._id,
      passcode: rawPasscode, // Returned once so owner/inviter can share it directly!
      expiresAt,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create invitation' });
  }
});

// GET /care-circles/:profileId/invitations
router.get('/:profileId/invitations', authenticate, requireProfileAccess(), async (req: AuthRequest, res: Response) => {
  try {
    const invitations = await Invitation.find({
      careProfile: req.params.profileId,
      status: 'pending',
    }).sort({ createdAt: -1 });

    res.json({ invitations });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch invitations' });
  }
});

// POST /invitations/verify-accept
router.post('/invitations/verify-accept', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { passcode, invitationId } = req.body;

    if (!passcode) {
      return res.status(400).json({ error: 'Passcode is required.' });
    }

    let invitation = null;
    if (invitationId) {
      invitation = await Invitation.findById(invitationId);
    } else {
      // Find pending invitations that are not expired
      const pendingList = await Invitation.find({
        status: 'pending',
        expiresAt: { $gt: new Date() },
      });

      for (const inv of pendingList) {
        if (inv.attemptCount < inv.maxAttempts) {
          const isMatch = await comparePasscode(passcode, inv.passcodeHash);
          if (isMatch) {
            invitation = inv;
            break;
          }
        }
      }
    }

    if (!invitation || invitation.status !== 'pending') {
      return res.status(404).json({ error: 'Invalid, already used, or expired passcode.' });
    }

    if (new Date() > invitation.expiresAt) {
      invitation.status = 'expired';
      await invitation.save();
      return res.status(410).json({ error: 'This invitation has expired.' });
    }

    if (invitation.attemptCount >= invitation.maxAttempts) {
      return res.status(429).json({ error: 'Maximum verification attempts exceeded. Ask for a new invite.' });
    }

    // Verify passcode
    const isMatch = await comparePasscode(passcode, invitation.passcodeHash);
    if (!isMatch) {
      invitation.attemptCount += 1;
      await invitation.save();
      return res.status(401).json({
        error: `Incorrect passcode. ${invitation.maxAttempts - invitation.attemptCount} attempts remaining.`,
      });
    }

    // Passcode valid! Check if already a member
    let membership = await CareCircleMembership.findOne({
      careProfile: invitation.careProfile,
      user: req.user._id,
    });

    if (membership) {
      membership.status = 'active';
      membership.role = invitation.role;
      membership.permissions = invitation.permissions;
      await membership.save();
    } else {
      membership = new CareCircleMembership({
        careProfile: invitation.careProfile,
        user: req.user._id,
        role: invitation.role,
        relationshipToOwner: invitation.relationshipToOwner,
        permissions: invitation.permissions,
        status: 'active',
        invitedBy: invitation.invitedBy,
        acceptedAt: new Date(),
      });
      await membership.save();
    }

    invitation.status = 'accepted';
    invitation.acceptedAt = new Date();
    invitation.acceptedBy = req.user._id;
    await invitation.save();

    await AuditLog.create({
      careProfile: invitation.careProfile,
      actor: req.user._id,
      action: 'INVITE_ACCEPTED',
      targetEntity: 'CareCircleMembership',
      targetEntityId: membership._id.toString(),
      details: { role: invitation.role },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const careProfile = await CareProfile.findById(invitation.careProfile);

    // Notify owner
    await Notification.create({
      careProfile: invitation.careProfile,
      recipientUser: careProfile?.owner,
      title: 'New Care Circle Member Joined',
      message: `${req.user.displayName} joined the care circle as a ${invitation.role === 'caregiver' ? 'Caregiver' : 'Family Member'}.`,
      type: 'care_circle_joined',
      channel: 'in_app',
    });

    res.json({
      message: 'Successfully joined care circle',
      membership,
      careProfile,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to verify invitation' });
  }
});

// DELETE /care-circles/:profileId/members/:memberId - Revoke membership
router.delete('/:profileId/members/:memberId', authenticate, requireProfileAccess(), async (req: AuthRequest, res: Response) => {
  try {
    const membership = await CareCircleMembership.findById(req.params.memberId);
    if (!membership || membership.careProfile.toString() !== req.params.profileId) {
      return res.status(404).json({ error: 'Membership not found' });
    }

    membership.status = 'revoked';
    membership.revokedAt = new Date();
    membership.revokedBy = req.user._id;
    membership.revocationReason = req.body.reason || 'Revoked by care circle admin/owner';
    await membership.save();

    await AuditLog.create({
      careProfile: req.params.profileId,
      actor: req.user._id,
      action: 'INVITE_REVOKED',
      targetEntity: 'CareCircleMembership',
      targetEntityId: membership._id.toString(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ message: 'Care circle access revoked successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to revoke membership' });
  }
});

export default router;
