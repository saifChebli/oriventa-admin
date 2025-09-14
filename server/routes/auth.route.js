import express from 'express'
import { createAccount, getAccount, getAllAccounts, login, logout } from '../controllers/admins/auth.controller.js'
import { checkRole, verifyToken } from '../middlewares/auth.js'

const router = express.Router()

router.post('/login' , login )
router.get('/logout' , logout)

router.get('/me' ,verifyToken, getAccount)

router.get('/all-users' ,verifyToken,checkRole ,  getAllAccounts)
router.post('/add-user' ,verifyToken,checkRole ,  createAccount)





export default router