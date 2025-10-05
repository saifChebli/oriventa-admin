import express from 'express'
import { addConsultation, deleteConsultation, getConsultations, updateConsultationStatus } from '../controllers/clients/consultation.controller.js'
import { addComment } from '../controllers/clients/consultation.controller.js'
import { verifyToken } from '../middlewares/auth.js'

const router = express.Router()

router.get('/', getConsultations )
router.post('/add-consultation', addConsultation )
router.patch('/update-consultation-status/:id', updateConsultationStatus )
router.patch('/add-comment/:id', verifyToken,  addComment )
router.delete('/delete-consultation/:id', verifyToken,  deleteConsultation )






export default router