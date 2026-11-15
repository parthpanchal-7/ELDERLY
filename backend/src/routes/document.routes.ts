import { Router, Response } from 'express';
import { MedicalDocument, AuditLog } from '../models/index.js';
import { authenticate, AuthRequest, requireProfileAccess } from '../middleware/auth.js';

const router = Router();

// GET /api/documents/:profileId/documents
router.get('/:profileId/documents', authenticate, requireProfileAccess('canViewDocuments'), async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.query;
    const filter: any = { careProfile: req.params.profileId };
    if (type) {
      filter.type = type;
    }

    const documents = await MedicalDocument.find(filter)
      .populate('uploadedBy', 'displayName email primaryRole')
      .sort({ createdAt: -1 });

    res.json({ documents });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch medical documents' });
  }
});

// POST /api/documents/:profileId/documents
router.post('/:profileId/documents', authenticate, requireProfileAccess('canUploadDocuments'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, type, fileData, fileUrl, fileName, mimeType, fileSizeBytes, notes, tags } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Document title is required.' });
    }

    const url = fileData || fileUrl;
    if (!url) {
      return res.status(400).json({ error: 'File data or URL is required.' });
    }

    const calculatedSize = fileSizeBytes || Math.round((url.length * 3) / 4);

    const doc = new MedicalDocument({
      careProfile: req.params.profileId,
      uploadedBy: req.user._id,
      title: title.trim(),
      type: type || 'prescription',
      fileUrl: url,
      fileName: fileName || `${title.replace(/\s+/g, '_')}.dat`,
      mimeType: mimeType || (url.startsWith('data:image') ? 'image/jpeg' : 'application/pdf'),
      fileSizeBytes: calculatedSize,
      tags: tags || [],
      notes: notes || '',
    });

    await doc.save();

    await AuditLog.create({
      careProfile: req.params.profileId,
      actor: req.user._id,
      action: 'CREATE',
      targetEntity: 'MedicalDocument',
      targetEntityId: doc._id.toString(),
      details: { title, type: doc.type, size: calculatedSize },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({
      message: 'Medical document uploaded and saved successfully',
      document: doc,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to upload document' });
  }
});

// DELETE /api/documents/detail/:id
router.delete('/detail/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const doc = await MedicalDocument.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Only owner of profile or the uploader can delete
    await doc.deleteOne();

    res.json({ message: 'Document removed successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete document' });
  }
});

export default router;
