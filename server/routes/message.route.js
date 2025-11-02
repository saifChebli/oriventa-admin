import express from 'express';
import { 
  sendMessage, 
  getInbox, 
  getSentMessages, 
  replyToThread, 
  getConversation,
  getAllMessages,
  deleteMessage,
  getMessageStats
} from '../controllers/messages/message.controller.js';
import { verifyToken } from '../middlewares/auth.js';

/**
 * Message Routes
 * All routes for email messaging system
 * 
 * Authentication: All routes require authentication via verifyToken middleware
 */

const router = express.Router();

/**
 * @route   POST /api/messages/send
 * @desc    Send a new email message
 * @access  Private (authenticated users)
 * @body    {String} senderName - Display name of sender
 * @body    {String} senderEmail - Email of sender (optional)
 * @body    {String} receiverEmail - Email of recipient
 * @body    {String} subject - Email subject
 * @body    {String} body - Email body (text or HTML)
 * @body    {String} userId - User ID sending the message
 * @body    {String} threadId - Optional thread ID
 */
router.post('/send', verifyToken, sendMessage);

/**
 * @route   GET /api/messages/inbox/:userId
 * @desc    Get inbox messages for a user
 * @access  Private (authenticated users)
 * @param   {String} userId - User ID
 * @query   {Number} page - Page number (default: 1)
 * @query   {Number} limit - Items per page (default: 20)
 */
router.get('/inbox/:userId', verifyToken, getInbox);

/**
 * @route   GET /api/messages/sent/:userId
 * @desc    Get sent messages for a user
 * @access  Private (authenticated users)
 * @param   {String} userId - User ID
 * @query   {Number} page - Page number (default: 1)
 * @query   {Number} limit - Items per page (default: 20)
 */
router.get('/sent/:userId', verifyToken, getSentMessages);

/**
 * @route   GET /api/messages/all/:userId
 * @desc    Get all messages for a user (sent and received)
 * @access  Private (authenticated users)
 * @param   {String} userId - User ID
 * @query   {Number} page - Page number (default: 1)
 * @query   {Number} limit - Items per page (default: 20)
 */
router.get('/all/:userId', verifyToken, getAllMessages);

/**
 * @route   POST /api/messages/reply/:threadId
 * @desc    Reply to a message thread
 * @access  Private (authenticated users)
 * @param   {String} threadId - Thread ID to reply to
 * @body    {String} senderName - Display name of sender
 * @body    {String} senderEmail - Email of sender (optional)
 * @body    {String} body - Reply body (text or HTML)
 * @body    {String} userId - User ID replying
 */
router.post('/reply/:threadId', verifyToken, replyToThread);

/**
 * @route   GET /api/messages/:threadId
 * @desc    Get full conversation by thread ID
 * @access  Private (authenticated users)
 * @param   {String} threadId - Thread ID
 */
router.get('/:threadId', verifyToken, getConversation);

/**
 * @route   GET /api/messages/stats/:userId
 * @desc    Get message statistics for a user
 * @access  Private (authenticated users)
 * @param   {String} userId - User ID
 */
router.get('/stats/:userId', verifyToken, getMessageStats);

/**
 * @route   DELETE /api/messages/:messageId
 * @desc    Delete a message
 * @access  Private (authenticated users)
 * @param   {String} messageId - Message ID to delete
 */
router.delete('/:messageId', verifyToken, deleteMessage);

export default router;
