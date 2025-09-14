import express from 'express'
import { addCandidate, getCandidates, updateCandidateStatus } from '../controllers/clients/candidate.controller.js'
import upload from '../middlewares/upload.js'

const router = express.Router()


router.get('/', getCandidates )
router.post('/add-candidate', upload.fields([
    { name: "cvFile", maxCount: 1 },
    { name: "attestationsTravail", maxCount: 1 },
    { name: "diplomasFiles", maxCount: 1 },
    { name: "attestationsStage", maxCount: 1 },
    { name: "paymentReceipt", maxCount: 1 },
  ]), addCandidate )

router.patch('/update-candidate-status/:id', updateCandidateStatus )








export default router