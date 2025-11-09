import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { checkRole, verifyToken } from '../middlewares/auth.js';
import { getSuiviForClient, getSuiviForUser, upsertSuivi } from '../controllers/clients/suivi.controller.js';
import fs from 'fs';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads/suivi directory exists
const uploadDir = path.join(__dirname, '../uploads/suivi');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    
    if (extname || mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Client: get own suivi
router.get('/me', verifyToken, getSuiviForClient);

// Manager/Admin: get & update a client's suivi
router.get('/:userId', verifyToken, checkRole, getSuiviForUser);
router.patch('/:userId', verifyToken, checkRole, upload.fields([
  { name: 'cvFile', maxCount: 10 },
  { name: 'lmFile', maxCount: 10 }
]), upsertSuivi);

// Delete a specific file from suivi
router.delete('/:userId/file', verifyToken, checkRole, async (req, res) => {
  try {
    const { userId } = req.params;
    const { filePath, fileType } = req.body; // fileType: 'cv' or 'lm'
    
    if (!filePath || !fileType) {
      return res.status(400).json({ message: 'File path and type required' });
    }

    const ClientSuivi = (await import('../models/ClientSuivi.js')).default;
    const suivi = await ClientSuivi.findOne({ user: userId });
    
    if (!suivi) {
      return res.status(404).json({ message: 'Suivi not found' });
    }

    // Delete file from filesystem
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // Remove from database
    if (fileType === 'cv') {
      suivi.cvFiles = suivi.cvFiles.filter(f => f !== filePath);
      if (suivi.cvFile === filePath) suivi.cvFile = '';
    } else if (fileType === 'lm') {
      suivi.lmFiles = suivi.lmFiles.filter(f => f !== filePath);
      if (suivi.lmFile === filePath) suivi.lmFile = '';
    }

    await suivi.save();
    res.status(200).json({ message: 'File deleted successfully', data: suivi });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Error deleting file' });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large. Maximum 10MB allowed.' });
    }
    return res.status(400).json({ message: error.message });
  }
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  next();
});

export default router;
