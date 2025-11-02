import mongoose from 'mongoose';

/**
 * Message Schema
 * Stores all email messages (sent and received) in the system
 * 
 * @property {String} senderName - Display name of the sender (e.g., "Admin", "Client Name")
 * @property {String} senderEmail - Email address of the sender
 * @property {String} receiverEmail - Email address of the recipient
 * @property {String} subject - Email subject line
 * @property {String} body - Email body content (can be HTML or plain text)
 * @property {String} threadId - Unique identifier to group related messages (conversation thread)
 * @property {String} status - Message status: 'sent', 'received', 'failed'
 * @property {Date} createdAt - Timestamp when the message was created
 * @property {mongoose.Schema.Types.ObjectId} userId - Reference to the User who sent or should receive the message
 * @property {String} messageId - Original email Message-ID header (for IMAP)
 * @property {String} inReplyTo - Message-ID this email is replying to (for threading)
 */
const messageSchema = new mongoose.Schema({
  senderName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  senderEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  receiverEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  body: {
    type: String,
    required: true
  },
  threadId: {
    type: String,
    required: true,
    index: true // Index for fast thread lookups
  },
  status: {
    type: String,
    enum: ['sent', 'received', 'failed', 'pending'],
    default: 'pending',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true // Index for fast user message lookups
  },
  messageId: {
    type: String,
    unique: true,
    sparse: true, // Allow null values, but enforce uniqueness when present
    trim: true
  },
  inReplyTo: {
    type: String,
    trim: true
  },
  isHtml: {
    type: Boolean,
    default: false
  },
  attachments: [{
    filename: String,
    path: String,
    contentType: String
  }]
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Compound index for efficient inbox/sent queries
messageSchema.index({ userId: 1, status: 1, createdAt: -1 });

// Compound index for thread conversations
messageSchema.index({ threadId: 1, createdAt: 1 });

/**
 * Static method to generate a unique thread ID
 * @returns {String} Unique thread identifier
 */
messageSchema.statics.generateThreadId = function() {
  return `thread_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Instance method to check if message is sent by system
 * @returns {Boolean}
 */
messageSchema.methods.isSentBySystem = function() {
  return this.senderEmail === process.env.SMTP_USER || 
         this.senderEmail === 'no-reply@oriventa-pro-service.tn';
};

/**
 * Virtual to get reply count in a thread
 */
messageSchema.virtual('replyCount', {
  ref: 'Message',
  localField: 'threadId',
  foreignField: 'threadId',
  count: true
});

// Enable virtuals in JSON output
messageSchema.set('toJSON', { virtuals: true });
messageSchema.set('toObject', { virtuals: true });

const Message = mongoose.model('Message', messageSchema);

export default Message;
