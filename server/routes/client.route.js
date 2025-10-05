import express from 'express';
import { 
  createClientAccount, 
  getAllClients, 
  getClientProfile, 
  updateClientProfile, 
  deleteClientAccount 
} from '../controllers/clients/client.controller.js';
import { checkRole, verifyToken } from '../middlewares/auth.js';

const router = express.Router();

// Routes for managers to manage client accounts
router.post('/create', verifyToken, checkRole, createClientAccount);
router.get('/all', verifyToken, checkRole, getAllClients);
router.delete('/:clientId', verifyToken, checkRole, deleteClientAccount);

// Routes for clients to manage their own profile
router.get('/profile', verifyToken, getClientProfile);
router.patch('/update-user/:id', verifyToken, updateClientProfile);
router.delete('/delete-user/:id', verifyToken, deleteClientAccount);
export default router;
