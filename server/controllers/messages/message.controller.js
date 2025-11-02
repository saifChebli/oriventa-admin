import Message from '../../models/Message.js';
import mailService from '../../services/mailService.js';
import User from '../../models/User.js';

/**
 * Message Controller
 * Handles all email message operations
 * 
 * Routes:
 * - POST /api/messages/send → sendMessage
 * - GET /api/messages/inbox/:userId → getInbox
 * - GET /api/messages/sent/:userId → getSentMessages
 * - POST /api/messages/reply/:threadId → replyToThread
 * - GET /api/messages/:threadId → getConversation
 */

/**
 * Send a new email message
 * 
 * @route POST /api/messages/send
 * @body {String} senderName - Display name of sender
 * @body {String} senderEmail - Email address of sender (optional, defaults to system email)
 * @body {String} receiverEmail - Email address of recipient
 * @body {String} subject - Email subject
 * @body {String} body - Email body (text or HTML)
 * @body {String} userId - ID of the user sending the message
 * @body {String} threadId - Optional thread ID for grouping messages
 * @returns {Object} Saved message document
 */
export const sendMessage = async (req, res) => {
  try {
    const {
      senderName,
      senderEmail,
      receiverEmail,
      subject,
      body,
      userId,
      threadId
    } = req.body;

    // Validation
    if (!senderName || !receiverEmail || !subject || !body) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: senderName, receiverEmail, subject, body'
      });
    }

    // Get user's email from database if userId is provided and no senderEmail
    let fromEmail = senderEmail;
    if (!fromEmail && userId) {
      try {
        const user = await User.findById(userId);
        if (user && user.email) {
          fromEmail = user.email;
        }
      } catch (err) {
        console.log('Could not fetch user email, using system email');
      }
    }
    
    // Fallback to system email if still not set
    if (!fromEmail) {
      fromEmail = process.env.SMTP_USER || 'no-reply@oriventa-pro-service.tn';
    }

    // Generate or use provided threadId
    const messageThreadId = threadId || Message.generateThreadId();

    // Generate unique message ID
    const messageId = mailService.generateMessageId();

    // Send email via SMTP
    // The mailService will show fromEmail in the "From" field
    // but authenticate using SMTP_USER credentials
    console.log(`📤 Sending email from ${fromEmail} to ${receiverEmail}...`);
    const sendResult = await mailService.sendEmail({
      from: fromEmail,
      fromName: senderName,
      to: receiverEmail,
      subject,
      body,
      messageId
    });

    // Save to database
    const newMessage = new Message({
      messageId,
      senderName,
      senderEmail: fromEmail.toLowerCase(),
      receiverEmail: receiverEmail.toLowerCase(),
      subject,
      body,
      threadId: messageThreadId,
      status: sendResult.success ? 'sent' : 'failed',
      userId: userId || null,
      isHtml: mailService.detectHtml(body)
    });

    const savedMessage = await newMessage.save();

    console.log(`✅ Message sent and saved: ${savedMessage._id}`);

    return res.status(201).json({
      success: true,
      message: 'Email sent successfully',
      data: savedMessage,
      emailInfo: {
        messageId: sendResult.messageId,
        response: sendResult.response
      }
    });

  } catch (error) {
    console.error('❌ Error sending message:', error);
    
    // Try to save failed message to database
    try {
      const failedMessage = new Message({
        senderName: req.body.senderName,
        senderEmail: req.body.senderEmail || process.env.SMTP_USER,
        receiverEmail: req.body.receiverEmail,
        subject: req.body.subject,
        body: req.body.body,
        threadId: req.body.threadId || Message.generateThreadId(),
        status: 'failed',
        userId: req.body.userId || null
      });
      await failedMessage.save();
    } catch (saveError) {
      console.error('❌ Error saving failed message:', saveError);
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
};

/**
 * Get inbox messages for a user
 * Returns all received messages for the specified user
 * 
 * @route GET /api/messages/inbox/:userId
 * @param {String} userId - User ID
 * @query {Number} page - Page number (default: 1)
 * @query {Number} limit - Items per page (default: 20)
 * @returns {Object} Paginated inbox messages
 */
export const getInbox = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Validation
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get user to find their email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find all received messages for this user's email
    const messages = await Message.find({
      receiverEmail: user.email.toLowerCase(),
      status: 'received'
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalCount = await Message.countDocuments({
      receiverEmail: user.email.toLowerCase(),
      status: 'received'
    });

    // Group by threads and get latest message from each thread
    const threadMap = new Map();
    for (const msg of messages) {
      if (!threadMap.has(msg.threadId)) {
        // Get thread message count
        const threadCount = await Message.countDocuments({ threadId: msg.threadId });
        threadMap.set(msg.threadId, {
          ...msg,
          messageCount: threadCount
        });
      }
    }

    const uniqueThreads = Array.from(threadMap.values());

    console.log(`📬 Retrieved ${messages.length} inbox messages for user ${userId}`);

    return res.status(200).json({
      success: true,
      data: {
        messages: uniqueThreads,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          limit
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching inbox:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch inbox',
      error: error.message
    });
  }
};

/**
 * Get sent messages for a user
 * Returns all messages sent by the specified user
 * 
 * @route GET /api/messages/sent/:userId
 * @param {String} userId - User ID
 * @query {Number} page - Page number (default: 1)
 * @query {Number} limit - Items per page (default: 20)
 * @returns {Object} Paginated sent messages
 */
export const getSentMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Validation
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get user to find their email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find all sent messages from this user's email
    const messages = await Message.find({
      senderEmail: user.email.toLowerCase(),
      status: 'sent'
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const totalCount = await Message.countDocuments({
      senderEmail: user.email.toLowerCase(),
      status: 'sent'
    });

    // Group by threads
    const threadMap = new Map();
    for (const msg of messages) {
      if (!threadMap.has(msg.threadId)) {
        const threadCount = await Message.countDocuments({ threadId: msg.threadId });
        threadMap.set(msg.threadId, {
          ...msg,
          messageCount: threadCount
        });
      }
    }

    const uniqueThreads = Array.from(threadMap.values());

    console.log(`📤 Retrieved ${messages.length} sent messages for user ${userId}`);

    return res.status(200).json({
      success: true,
      data: {
        messages: uniqueThreads,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          limit
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching sent messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sent messages',
      error: error.message
    });
  }
};

/**
 * Reply to a message thread
 * Sends a reply and associates it with the existing thread
 * 
 * @route POST /api/messages/reply/:threadId
 * @param {String} threadId - Thread ID to reply to
 * @body {String} senderName - Display name of sender
 * @body {String} senderEmail - Email address of sender
 * @body {String} body - Reply body (text or HTML)
 * @body {String} userId - ID of the user replying
 * @returns {Object} Saved reply message
 */
export const replyToThread = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { senderName, senderEmail, body, userId } = req.body;

    // Validation
    if (!threadId || !senderName || !body) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: threadId, senderName, body'
      });
    }

    // Get the original message in the thread
    const originalMessage = await Message.findOne({ threadId }).sort({ createdAt: 1 });
    if (!originalMessage) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      });
    }

    // Determine receiver email (reply to the original sender)
    const receiverEmail = originalMessage.senderEmail;
    const subject = originalMessage.subject.startsWith('Re:') 
      ? originalMessage.subject 
      : `Re: ${originalMessage.subject}`;

    // Get user's email from database if userId is provided and no senderEmail
    let fromEmail = senderEmail;
    if (!fromEmail && userId) {
      try {
        const user = await User.findById(userId);
        if (user && user.email) {
          fromEmail = user.email;
        }
      } catch (err) {
        console.log('Could not fetch user email, using system email');
      }
    }
    
    // Fallback to system email if still not set
    if (!fromEmail) {
      fromEmail = process.env.SMTP_USER || 'no-reply@oriventa-pro-service.tn';
    }

    // Generate unique message ID for the reply
    const messageId = mailService.generateMessageId();

    // Get all message IDs in this thread for proper threading
    const threadMessages = await Message.find({ threadId }).select('messageId').lean();
    const references = threadMessages.map(m => m.messageId).filter(Boolean);

    // Send reply email
    console.log(`📤 Sending reply from ${fromEmail} to ${receiverEmail}...`);
    const sendResult = await mailService.sendEmail({
      from: fromEmail,
      fromName: senderName,
      to: receiverEmail,
      subject,
      body,
      messageId,
      inReplyTo: originalMessage.messageId,
      references: references.join(' ')
    });

    // Save reply to database
    const replyMessage = new Message({
      messageId,
      senderName,
      senderEmail: fromEmail.toLowerCase(),
      receiverEmail: receiverEmail.toLowerCase(),
      subject,
      body,
      threadId,
      status: sendResult.success ? 'sent' : 'failed',
      userId: userId || null,
      inReplyTo: originalMessage.messageId,
      isHtml: mailService.detectHtml(body)
    });

    const savedReply = await replyMessage.save();

    console.log(`✅ Reply sent and saved: ${savedReply._id}`);

    return res.status(201).json({
      success: true,
      message: 'Reply sent successfully',
      data: savedReply
    });

  } catch (error) {
    console.error('❌ Error sending reply:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send reply',
      error: error.message
    });
  }
};

/**
 * Get full conversation by thread ID
 * Returns all messages in a thread, ordered chronologically
 * 
 * @route GET /api/messages/:threadId
 * @param {String} threadId - Thread ID
 * @returns {Object} All messages in the thread
 */
export const getConversation = async (req, res) => {
  try {
    const { threadId } = req.params;

    // Validation
    if (!threadId) {
      return res.status(400).json({
        success: false,
        message: 'Thread ID is required'
      });
    }

    // Get all messages in the thread
    const messages = await Message.find({ threadId })
      .sort({ createdAt: 1 }) // Chronological order
      .lean();

    if (messages.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      });
    }

    console.log(`💬 Retrieved ${messages.length} messages in thread ${threadId}`);

    return res.status(200).json({
      success: true,
      data: {
        threadId,
        messageCount: messages.length,
        messages
      }
    });

  } catch (error) {
    console.error('❌ Error fetching conversation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation',
      error: error.message
    });
  }
};

/**
 * Get all messages for a user (both sent and received)
 * 
 * @route GET /api/messages/all/:userId
 * @param {String} userId - User ID
 * @query {Number} page - Page number (default: 1)
 * @query {Number} limit - Items per page (default: 20)
 * @returns {Object} Paginated messages
 */
export const getAllMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Validation
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userEmail = user.email.toLowerCase();

    // Find all messages (sent or received)
    const messages = await Message.find({
      $or: [
        { senderEmail: userEmail },
        { receiverEmail: userEmail }
      ]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalCount = await Message.countDocuments({
      $or: [
        { senderEmail: userEmail },
        { receiverEmail: userEmail }
      ]
    });

    console.log(`📧 Retrieved ${messages.length} total messages for user ${userId}`);

    return res.status(200).json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          limit
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching all messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

/**
 * Delete a message
 * 
 * @route DELETE /api/messages/:messageId
 * @param {String} messageId - Message ID
 * @returns {Object} Success status
 */
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const deletedMessage = await Message.findByIdAndDelete(messageId);

    if (!deletedMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    console.log(`🗑️  Deleted message: ${messageId}`);

    return res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting message:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
};

/**
 * Get message statistics for a user
 * 
 * @route GET /api/messages/stats/:userId
 * @param {String} userId - User ID
 * @returns {Object} Statistics
 */
export const getMessageStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userEmail = user.email.toLowerCase();

    // Count messages by status
    const sentCount = await Message.countDocuments({
      senderEmail: userEmail,
      status: 'sent'
    });

    const receivedCount = await Message.countDocuments({
      receiverEmail: userEmail,
      status: 'received'
    });

    const failedCount = await Message.countDocuments({
      senderEmail: userEmail,
      status: 'failed'
    });

    // Count unique threads
    const threads = await Message.distinct('threadId', {
      $or: [
        { senderEmail: userEmail },
        { receiverEmail: userEmail }
      ]
    });

    return res.status(200).json({
      success: true,
      data: {
        sent: sentCount,
        received: receivedCount,
        failed: failedCount,
        totalThreads: threads.length
      }
    });

  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};
