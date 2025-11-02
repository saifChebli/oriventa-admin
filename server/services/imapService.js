import Imap from 'imap';
import { simpleParser } from 'mailparser';
import Message from '../models/Message.js';
import 'dotenv/config';

/**
 * IMAP Service
 * Periodically fetches incoming emails from IMAP server and stores them in MongoDB
 * 
 * Configuration via environment variables:
 * - IMAP_HOST: IMAP server hostname
 * - IMAP_PORT: IMAP server port (usually 993 for SSL)
 * - IMAP_USER: IMAP authentication username (email address)
 * - IMAP_PASS: IMAP authentication password
 * - IMAP_TLS: Use TLS/SSL (default: true)
 * - IMAP_FETCH_INTERVAL: How often to check for new emails in milliseconds (default: 60000 = 1 minute)
 */

class ImapService {
  constructor() {
    this.imap = null;
    this.isConnected = false;
    this.fetchInterval = null;
    this.processedMessageIds = new Set(); // Track processed messages to avoid duplicates

    // IMAP configuration
    this.config = {
      user: process.env.IMAP_USER || 'no-reply@oriventa-pro-service.tn',
      password: process.env.IMAP_PASS,
      host: process.env.IMAP_HOST || 'mail.oriventa-pro-service.tn',
      port: parseInt(process.env.IMAP_PORT) || 993,
      tls: process.env.IMAP_TLS !== 'false',
      tlsOptions: { 
        rejectUnauthorized: false // Accept self-signed certificates if needed
      },
      authTimeout: 10000,
      connTimeout: 10000
    };

    // Fetch interval (default: 1 minute)
    this.fetchIntervalMs = parseInt(process.env.IMAP_FETCH_INTERVAL) || 60000;
  }

  /**
   * Initialize IMAP connection
   * Sets up event handlers and starts periodic fetching
   */
  initialize() {
    if (!this.config.password) {
      console.warn('⚠️  IMAP password not configured. Email fetching is disabled.');
      return;
    }

    console.log('🔌 Initializing IMAP service...');
    this.connect();
  }

  /**
   * Connect to IMAP server
   */
  connect() {
    try {
      this.imap = new Imap(this.config);

      // Connection ready
      this.imap.once('ready', () => {
        console.log('✅ IMAP Connection established');
        this.isConnected = true;
        this.openInbox();
      });

      // Connection error
      this.imap.once('error', (err) => {
        console.error('❌ IMAP Connection Error:', err.message);
        this.isConnected = false;
        
        // Attempt to reconnect after 30 seconds
        setTimeout(() => {
          console.log('🔄 Attempting to reconnect to IMAP...');
          this.connect();
        }, 30000);
      });

      // Connection ended
      this.imap.once('end', () => {
        console.log('📪 IMAP Connection ended');
        this.isConnected = false;
      });

      // Connect to server
      this.imap.connect();
    } catch (error) {
      console.error('❌ Error initializing IMAP:', error.message);
    }
  }

  /**
   * Open INBOX and start periodic fetching
   */
  openInbox() {
    this.imap.openBox('INBOX', false, (err, box) => {
      if (err) {
        console.error('❌ Error opening INBOX:', err.message);
        return;
      }

      console.log(`📬 INBOX opened (${box.messages.total} total messages)`);
      
      // Fetch existing unread messages
      this.fetchUnreadMessages();

      // Start periodic fetching
      this.startPeriodicFetch();

      // Listen for new mail events
      this.imap.on('mail', (numNewMsgs) => {
        console.log(`📨 ${numNewMsgs} new message(s) arrived`);
        this.fetchUnreadMessages();
      });
    });
  }

  /**
   * Start periodic fetching of emails
   */
  startPeriodicFetch() {
    if (this.fetchInterval) {
      clearInterval(this.fetchInterval);
    }

    this.fetchInterval = setInterval(() => {
      if (this.isConnected) {
        console.log('🔄 Periodic email check...');
        this.fetchUnreadMessages();
      }
    }, this.fetchIntervalMs);

    console.log(`⏰ Periodic fetch started (every ${this.fetchIntervalMs / 1000} seconds)`);
  }

  /**
   * Fetch unread messages from INBOX
   */
  fetchUnreadMessages() {
    if (!this.isConnected || !this.imap) {
      console.log('⚠️  IMAP not connected. Skipping fetch.');
      return;
    }

    try {
      // Search for unseen (unread) messages
      this.imap.search(['UNSEEN'], (err, results) => {
        if (err) {
          console.error('❌ Error searching messages:', err.message);
          return;
        }

        if (!results || results.length === 0) {
          console.log('📭 No new unread messages');
          return;
        }

        console.log(`📬 Found ${results.length} unread message(s)`);

        // Fetch the messages
        const fetch = this.imap.fetch(results, {
          bodies: '', // Fetch entire message
          markSeen: true // Mark as read after fetching
        });

        fetch.on('message', (msg, seqno) => {
          this.processMessage(msg, seqno);
        });

        fetch.once('error', (err) => {
          console.error('❌ Fetch error:', err.message);
        });

        fetch.once('end', () => {
          console.log('✅ Finished fetching messages');
        });
      });
    } catch (error) {
      console.error('❌ Error in fetchUnreadMessages:', error.message);
    }
  }

  /**
   * Process individual email message
   * 
   * @param {Object} msg - IMAP message object
   * @param {Number} seqno - Sequence number
   */
  processMessage(msg, seqno) {
    let buffer = '';

    msg.on('body', (stream, info) => {
      stream.on('data', (chunk) => {
        buffer += chunk.toString('utf8');
      });

      stream.once('end', async () => {
        try {
          // Parse the email
          const parsed = await simpleParser(buffer);
          
          // Extract important fields
          const messageId = parsed.messageId;
          const from = parsed.from?.value?.[0];
          const to = parsed.to?.value?.[0];
          const subject = parsed.subject || '(No Subject)';
          const body = parsed.html || parsed.textAsHtml || parsed.text || '';
          const inReplyTo = parsed.inReplyTo;
          const references = parsed.references;

          // Skip if already processed
          if (this.processedMessageIds.has(messageId)) {
            console.log(`⏭️  Message ${messageId} already processed. Skipping.`);
            return;
          }

          console.log(`📧 Processing message ${seqno}: ${subject}`);
          console.log(`   From: ${from?.address}`);
          console.log(`   To: ${to?.address}`);

          // Save to database
          await this.saveMessageToDatabase({
            messageId,
            from: from?.address,
            fromName: from?.name || from?.address,
            to: to?.address,
            subject,
            body,
            inReplyTo,
            references: Array.isArray(references) ? references : [references].filter(Boolean),
            isHtml: !!parsed.html
          });

          // Mark as processed
          this.processedMessageIds.add(messageId);

        } catch (error) {
          console.error(`❌ Error parsing message ${seqno}:`, error.message);
        }
      });
    });

    msg.once('attributes', (attrs) => {
      console.log(`📋 Message ${seqno} attributes:`, attrs.uid);
    });

    msg.once('end', () => {
      console.log(`✅ Finished processing message ${seqno}`);
    });
  }

  /**
   * Save received email to MongoDB
   * 
   * @param {Object} emailData - Parsed email data
   */
  async saveMessageToDatabase(emailData) {
    try {
      const { messageId, from, fromName, to, subject, body, inReplyTo, references, isHtml } = emailData;

      // Check if message already exists
      const existing = await Message.findOne({ messageId });
      if (existing) {
        console.log(`⏭️  Message ${messageId} already in database. Skipping.`);
        return;
      }

      // Determine threadId
      let threadId;
      
      if (inReplyTo) {
        // This is a reply - find the original message's thread
        const originalMessage = await Message.findOne({ messageId: inReplyTo });
        if (originalMessage) {
          threadId = originalMessage.threadId;
          console.log(`🔗 Message is a reply. Using thread: ${threadId}`);
        }
      }

      // If no threadId found from reply, check references
      if (!threadId && references && references.length > 0) {
        for (const ref of references) {
          const refMessage = await Message.findOne({ messageId: ref });
          if (refMessage) {
            threadId = refMessage.threadId;
            console.log(`🔗 Found thread from references: ${threadId}`);
            break;
          }
        }
      }

      // If still no threadId, create a new thread
      if (!threadId) {
        threadId = Message.generateThreadId();
        console.log(`🆕 Creating new thread: ${threadId}`);
      }

      // Find the user associated with the recipient email
      // This assumes you have a User model with an email field
      let userId = null;
      try {
        const User = (await import('../models/User.js')).default;
        const user = await User.findOne({ email: to.toLowerCase() });
        if (user) {
          userId = user._id;
          console.log(`👤 Associated with user: ${user.email}`);
        }
      } catch (error) {
        console.log('⚠️  Could not find user for email:', to);
      }

      // Create new message document
      const newMessage = new Message({
        messageId,
        senderName: fromName,
        senderEmail: from.toLowerCase(),
        receiverEmail: to.toLowerCase(),
        subject,
        body,
        threadId,
        status: 'received',
        userId,
        inReplyTo,
        isHtml
      });

      await newMessage.save();
      console.log(`💾 Saved message to database: ${subject}`);

    } catch (error) {
      console.error('❌ Error saving message to database:', error.message);
      throw error;
    }
  }

  /**
   * Fetch all messages since a specific date
   * 
   * @param {Date} sinceDate - Fetch messages since this date
   */
  async fetchMessagesSince(sinceDate) {
    if (!this.isConnected || !this.imap) {
      console.log('⚠️  IMAP not connected');
      return;
    }

    const dateStr = sinceDate.toISOString().split('T')[0].replace(/-/g, '-');
    
    this.imap.search([['SINCE', dateStr]], (err, results) => {
      if (err) {
        console.error('❌ Error searching messages:', err.message);
        return;
      }

      if (!results || results.length === 0) {
        console.log(`📭 No messages since ${dateStr}`);
        return;
      }

      console.log(`📬 Found ${results.length} message(s) since ${dateStr}`);

      const fetch = this.imap.fetch(results, {
        bodies: '',
        markSeen: false // Don't mark as read for bulk fetch
      });

      fetch.on('message', (msg, seqno) => {
        this.processMessage(msg, seqno);
      });

      fetch.once('end', () => {
        console.log('✅ Finished bulk fetch');
      });
    });
  }

  /**
   * Stop the IMAP service
   */
  stop() {
    console.log('⏹️  Stopping IMAP service...');
    
    if (this.fetchInterval) {
      clearInterval(this.fetchInterval);
      this.fetchInterval = null;
    }

    if (this.imap) {
      this.imap.end();
      this.imap = null;
    }

    this.isConnected = false;
    console.log('✅ IMAP service stopped');
  }

  /**
   * Get service status
   * 
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      connected: this.isConnected,
      processedCount: this.processedMessageIds.size,
      fetchInterval: this.fetchIntervalMs,
      config: {
        host: this.config.host,
        port: this.config.port,
        user: this.config.user
      }
    };
  }
}

// Export a singleton instance
const imapService = new ImapService();
export default imapService;
