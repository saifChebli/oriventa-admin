import express from 'express'
import { getResumes, addResume, updateResumeStatus, downloadFile, deleteResume} from '../controllers/clients/creation.controller.js'
import multer from 'multer';

const router = express.Router()
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/receipts");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });


router.get('/', getResumes )
router.get("/download/:filename",downloadFile)
router.post('/add-resume' ,upload.single("paymentReceipt"), addResume)
router.patch('/update-status/:id', updateResumeStatus )
router.delete('/delete-resume/:id', deleteResume )






export default router