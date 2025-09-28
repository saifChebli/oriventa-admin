import express from 'express'
import { addConsultation, getConsultations, updateConsultationStatus } from '../controllers/clients/consultation.controller.js'
import { addComment } from '../controllers/clients/consultation.controller.js'
import { verifyToken } from '../middlewares/auth.js'

const router = express.Router()

router.get('/', getConsultations )
router.post('/add-consultation', addConsultation )
router.patch('/update-consultation-status/:id', updateConsultationStatus )
router.patch('/add-comment/:id', verifyToken,  addComment )







export default router