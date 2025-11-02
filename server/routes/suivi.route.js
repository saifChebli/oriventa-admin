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
