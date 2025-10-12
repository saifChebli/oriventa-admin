import express from 'express';
import multer from 'multer';
import path from 'path';
import { checkRole, verifyToken } from '../middlewares/auth.js';
import { getSuiviForClient, getSuiviForUser, upsertSuivi } from '../controllers/clients/suivi.controller.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/suivi');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Client: get own suivi
router.get('/me', verifyToken, getSuiviForClient);

// Manager/Admin: get & update a client's suivi
router.get('/:userId', verifyToken, checkRole, getSuiviForUser);
router.patch('/:userId', verifyToken, checkRole, upload.fields([{ name: 'cvFile', maxCount: 1 }, { name: 'lmFile', maxCount: 1 }]), upsertSuivi);

export default router;
