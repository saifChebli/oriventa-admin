import express from 'express'
import { addConsultation, getConsultations, updateConsultationStatus } from '../controllers/clients/consultation.controller.js'

const router = express.Router()

router.get('/', getConsultations )
router.post('/add-consultation', addConsultation )
router.patch('/update-consultation-status/:id', updateConsultationStatus )








export default router