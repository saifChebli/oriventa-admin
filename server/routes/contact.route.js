import express from 'express'
import { addContact, deleteContact, getContacts, updateContactStatus } from '../controllers/clients/contact.controller.js'

const router = express.Router()

router.get('/get-list', getContacts )
router.post('/', addContact )
router.patch('/:id', updateContactStatus )
router.delete('/delete-contact/:id', deleteContact )





export default router