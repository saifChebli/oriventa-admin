# Email Messaging System - Complete Documentation

## 📧 Overview

A full-featured email messaging system built with Node.js, Express, MongoDB, Nodemailer, and IMAP. This system enables:

- ✉️ **Sending emails** via SMTP with Nodemailer
- 📬 **Receiving emails** automatically via IMAP
- 🔗 **Email threading** for conversation tracking
- 👥 **Multi-user support** (Admins, Clients, Companies)
- 📝 **HTML & Text email** templates
- 💾 **MongoDB storage** for all messages

## 🏗️ Architecture

### System Flow

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │ ◄─────► │   Express    │ ◄─────► │   MongoDB   │
│  (Browser)  │         │    Server    │         │  (Messages) │
└─────────────┘         └──────────────┘         └─────────────┘
                              │   │
                    ┌─────────┘   └─────────┐
                    ▼                       ▼
            ┌──────────────┐        ┌──────────────┐
            │ SMTP Server  │        │ IMAP Server  │
            │  (Sending)   │        │ (Receiving)  │
            └──────────────┘        └──────────────┘
                    │                       │
                    └───────────┬───────────┘
                                ▼
                        ┌──────────────┐
                        │  Companies   │
                        │ (Recipients) │
                        └──────────────┘
```

## 📦 Components

### 1. Message Model (`models/Message.js`)
MongoDB schema for storing email messages:
- **senderName**: Display name of sender
- **senderEmail**: Email address of sender
- **receiverEmail**: Email address of recipient
- **subject**: Email subject line
- **body**: Email content (text or HTML)
- **threadId**: Unique identifier for conversation threading
- **status**: Message status (sent, received, failed, pending)
- **userId**: Reference to User model
- **messageId**: Email Message-ID header
- **inReplyTo**: Message-ID this email replies to
- **isHtml**: Boolean for HTML detection
- **timestamps**: Auto-generated createdAt/updatedAt

### 2. Mail Service (`services/mailService.js`)
Handles all outgoing email operations:
- **SMTP Configuration**: Connects to mail.oriventa-pro-service.tn
- **Text Emails**: Send plain text messages
- **HTML Emails**: Send formatted HTML messages
- **Templates**: Predefined email templates (welcome, notification, reply)
- **Threading Support**: Proper Message-ID and In-Reply-To headers
- **Auto-detection**: Automatically detects HTML vs text

### 3. IMAP Service (`services/imapService.js`)
Automatically fetches incoming emails:
- **Periodic Checking**: Checks inbox every 60 seconds (configurable)
- **Unread Messages**: Fetches only new unread emails
- **Auto-save**: Saves received emails to MongoDB
- **Thread Matching**: Automatically associates replies with existing threads
- **User Matching**: Links emails to users by email address
- **Reconnection**: Auto-reconnects on connection failures

### 4. Message Controller (`controllers/messages/message.controller.js`)
API endpoint handlers:
- **sendMessage**: Send a new email
- **getInbox**: Get received messages for a user
- **getSentMessages**: Get sent messages for a user
- **replyToThread**: Reply to an existing conversation
- **getConversation**: Get full thread conversation
- **getAllMessages**: Get all messages for a user
- **deleteMessage**: Delete a message
- **getMessageStats**: Get messaging statistics

### 5. Message Routes (`routes/message.route.js`)
RESTful API endpoints (all require authentication):
- `POST /api/messages/send` - Send email
- `GET /api/messages/inbox/:userId` - Get inbox
- `GET /api/messages/sent/:userId` - Get sent messages
- `GET /api/messages/all/:userId` - Get all messages
- `POST /api/messages/reply/:threadId` - Reply to thread
- `GET /api/messages/:threadId` - Get conversation
- `GET /api/messages/stats/:userId` - Get statistics
- `DELETE /api/messages/:messageId` - Delete message

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the server directory with:

```env
# SMTP Configuration (Sending)
SMTP_HOST=mail.oriventa-pro-service.tn
SMTP_PORT=465
SMTP_USER=no-reply@oriventa-pro-service.tn
SMTP_PASS=your_password_here

# IMAP Configuration (Receiving)
IMAP_HOST=mail.oriventa-pro-service.tn
IMAP_PORT=993
IMAP_USER=no-reply@oriventa-pro-service.tn
IMAP_PASS=your_password_here
IMAP_TLS=true
IMAP_FETCH_INTERVAL=60000

# Database
MONGODB_URI=your_mongodb_connection_string

# Server
PORT=5000
```

### Installation

1. **Install Dependencies**:
```bash
cd server
npm install
```

The following packages are included:
- `nodemailer` - SMTP email sending
- `imap` - IMAP email receiving
- `mailparser` - Email parsing
- `mongoose` - MongoDB ODM
- `express` - Web framework
- `dotenv` - Environment variables

2. **Configure Environment**:
- Copy `.env.email.example` to `.env`
- Add your email credentials
- Verify SMTP and IMAP settings

3. **Start Server**:
```bash
npm start
```

## 🚀 Usage Examples

### 1. Send a New Email

```javascript
POST /api/messages/send
Content-Type: application/json
Authorization: Bearer <token>

{
  "senderName": "John Doe",
  "receiverEmail": "company@example.com",
  "subject": "Job Application",
  "body": "<h1>Hello!</h1><p>I am applying for the position...</p>",
  "userId": "user_id_here"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Email sent successfully",
  "data": {
    "_id": "message_id",
    "threadId": "thread_123",
    "status": "sent",
    "createdAt": "2025-10-26T..."
  }
}
```

### 2. Get Inbox Messages

```javascript
GET /api/messages/inbox/user_id_here?page=1&limit=20
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "msg_id",
        "senderName": "Company HR",
        "senderEmail": "hr@company.com",
        "subject": "Re: Job Application",
        "threadId": "thread_123",
        "messageCount": 3,
        "createdAt": "2025-10-26T..."
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 100,
      "limit": 20
    }
  }
}
```

### 3. Reply to a Thread

```javascript
POST /api/messages/reply/thread_123
Content-Type: application/json
Authorization: Bearer <token>

{
  "senderName": "John Doe",
  "body": "Thank you for your response...",
  "userId": "user_id_here"
}
```

### 4. Get Full Conversation

```javascript
GET /api/messages/thread_123
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "threadId": "thread_123",
    "messageCount": 3,
    "messages": [
      {
        "senderName": "John Doe",
        "subject": "Job Application",
        "body": "...",
        "createdAt": "2025-10-26T10:00:00Z"
      },
      {
        "senderName": "Company HR",
        "subject": "Re: Job Application",
        "body": "...",
        "createdAt": "2025-10-26T11:00:00Z"
      }
    ]
  }
}
```

## 🔧 Advanced Features

### Email Templates

The mail service includes built-in templates:

**Welcome Template**:
```javascript
mailService.sendTemplatedEmail('welcome', {
  name: 'John Doe',
  message: 'Welcome to our platform!',
  actionUrl: 'https://example.com/dashboard',
  actionText: 'Get Started'
}, {
  to: 'user@example.com',
  subject: 'Welcome!',
  fromName: 'Oriventa Team'
});
```

**Notification Template**:
```javascript
mailService.sendTemplatedEmail('notification', {
  title: 'New Message',
  body: '<p>You have received a new message...</p>'
}, {
  to: 'user@example.com',
  subject: 'New Notification',
  fromName: 'Oriventa System'
});
```

### Threading

Messages are automatically grouped into threads:
- First message creates a new `threadId`
- Replies use the same `threadId`
- Proper `Message-ID` and `In-Reply-To` headers
- Conversation history maintained

### IMAP Auto-Fetching

The IMAP service automatically:
1. Connects to the inbox on startup
2. Fetches unread messages every 60 seconds
3. Parses email content (HTML/text)
4. Matches replies to existing threads
5. Associates with user accounts
6. Saves to MongoDB with status "received"

## 🔍 Monitoring

### Console Logs

The system provides detailed logging:

**SMTP Connection**:
```
✅ SMTP Server is ready to send emails
```

**IMAP Connection**:
```
🔌 Initializing IMAP service...
✅ IMAP Connection established
📬 INBOX opened (42 total messages)
⏰ Periodic fetch started (every 60 seconds)
```

**Sending Email**:
```
📤 Sending email to company@example.com...
✅ Message sent and saved: 67abc123
```

**Receiving Email**:
```
📨 1 new message(s) arrived
📧 Processing message 1: Job Application Response
   From: hr@company.com
   To: no-reply@oriventa-pro-service.tn
🔗 Message is a reply. Using thread: thread_123
💾 Saved message to database: Job Application Response
```

### Status Endpoint

Check IMAP service status:
```javascript
const status = imapService.getStatus();
console.log(status);
// {
//   connected: true,
//   processedCount: 42,
//   fetchInterval: 60000,
//   config: { host: "mail.oriventa-pro-service.tn", port: 993, ... }
// }
```

## 🛠️ Troubleshooting

### SMTP Issues

**"Invalid login"**:
- Check SMTP_USER and SMTP_PASS in .env
- Verify credentials with email provider
- Try app-specific password if 2FA enabled

**"Connection timeout"**:
- Check SMTP_HOST and SMTP_PORT
- Verify firewall allows outgoing port 465/587
- Test connection: `telnet mail.oriventa-pro-service.tn 465`

### IMAP Issues

**"IMAP not connected"**:
- Check IMAP_USER and IMAP_PASS
- Verify IMAP is enabled on email account
- Check IMAP_PORT (usually 993 for SSL)

**"No new messages"**:
- Verify inbox has unread emails
- Check IMAP_FETCH_INTERVAL isn't too long
- Manual test: send email and wait for fetch cycle

### Database Issues

**"User not found"**:
- Ensure User model has email field
- Check email address matches exactly (case-insensitive)
- Verify user exists in database

## 📊 Database Schema

### Message Collection

```javascript
{
  _id: ObjectId,
  messageId: String (unique),
  senderName: String,
  senderEmail: String,
  receiverEmail: String,
  subject: String,
  body: String,
  threadId: String (indexed),
  status: String (enum),
  userId: ObjectId (ref: User),
  inReplyTo: String,
  isHtml: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```javascript
// Single field indexes
{ threadId: 1 }
{ userId: 1 }
{ messageId: 1 } (unique, sparse)

// Compound indexes
{ userId: 1, status: 1, createdAt: -1 }
{ threadId: 1, createdAt: 1 }
```

## 🔒 Security

### Authentication

All message routes require authentication:
```javascript
router.post('/send', verifyToken, sendMessage);
```

The `verifyToken` middleware:
- Validates JWT token
- Attaches user to request
- Returns 401 if unauthorized

### Email Validation

Email addresses are validated:
```javascript
validate: {
  validator: function(v) {
    return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
  }
}
```

### Best Practices

1. **Never expose credentials**:
   - Keep .env file secure
   - Add .env to .gitignore
   - Use environment-specific configs

2. **Rate Limiting**:
   - Consider adding rate limits to prevent abuse
   - Limit email sending per user/hour

3. **Validation**:
   - Validate all input
   - Sanitize HTML content
   - Check email format

4. **Error Handling**:
   - Never expose internal errors to clients
   - Log errors securely
   - Return generic error messages

## 📈 Performance

### Optimization Tips

1. **IMAP Fetch Interval**:
   - Default: 60 seconds
   - Adjust based on usage
   - Lower = faster, but more server load

2. **Pagination**:
   - Use page/limit params
   - Default: 20 messages per page
   - Cache frequently accessed threads

3. **Indexes**:
   - All critical fields are indexed
   - Monitor slow queries
   - Add indexes as needed

4. **Message Cleanup**:
   - Consider archiving old messages
   - Implement retention policies
   - Regular database maintenance

## 🧪 Testing

### Manual Testing

1. **Send Test Email**:
```bash
curl -X POST http://localhost:5000/api/messages/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "senderName": "Test User",
    "receiverEmail": "test@example.com",
    "subject": "Test Email",
    "body": "This is a test email",
    "userId": "USER_ID"
  }'
```

2. **Check Inbox**:
```bash
curl http://localhost:5000/api/messages/inbox/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Integration Testing

Create test scripts to:
- Send email and verify in database
- Test threading functionality
- Verify IMAP fetching
- Test error handling

## 📚 API Reference

See [API_REFERENCE.md](./API_REFERENCE.md) for complete endpoint documentation.

## 🤝 Support

For issues or questions:
1. Check console logs for errors
2. Verify environment variables
3. Test SMTP/IMAP connection manually
4. Review this documentation
5. Contact system administrator

## 📄 License

Proprietary - Oriventa Pro Service © 2025

---

**Built with ❤️ for Oriventa Pro Service**
