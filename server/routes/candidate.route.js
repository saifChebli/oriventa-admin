import express from 'express'
import { addCandidate, addComment, deleteCandidate, downloadFolder, getCandidates, updateCandidateStatus } from '../controllers/clients/candidate.controller.js'
import upload from '../middlewares/upload.js'
import { verifyToken } from '../middlewares/auth.js'

const router = express.Router()


router.get('/', getCandidates )
router.post('/add-candidate', upload.fields([
    { name: "cvFile", maxCount: 1 },
    { name: "attestationsTravail", maxCount: 1 },
    { name: "diplomasFiles", maxCount: 1 },
    { name: "attestationsStage", maxCount: 1 },
    { name: "paymentReceipt", maxCount: 1 },
    { name: "photoPersonne", maxCount: 1 },
    { name: "passportPhoto", maxCount: 1 },
  ]), addCandidate )
router.get('/download-folder/:dossierNumber/:fullName',downloadFolder)
router.patch('/update-candidate-status/:id', updateCandidateStatus )
router.patch('/add-comment/:id', verifyToken,  addComment )
router.delete('/delete-candidate/:id', verifyToken,  deleteCandidate )







export default router