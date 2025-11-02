# Email System API Reference

## Base URL
```
http://localhost:5000/api/messages
```

All endpoints require authentication via Bearer token in the Authorization header.

---

## Endpoints

### 1. Send Email Message

Send a new email message.

**Endpoint**: `POST /send`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "senderName": "John Doe",           // Required: Display name
  "senderEmail": "user@example.com",  // Optional: Defaults to system email
  "receiverEmail": "company@test.com", // Required: Recipient email
  "subject": "Application Inquiry",    // Required: Email subject
  "body": "Hello, I am interested...", // Required: Email content (HTML or text)
  "userId": "user123",                 // Required: User ID
  "threadId": "thread_abc"             // Optional: For existing threads
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Email sent successfully",
  "data": {
    "_id": "msg123",
    "threadId": "thread_abc123",
    "status": "sent",
    "senderName": "John Doe",
    "receiverEmail": "company@test.com",
    "subject": "Application Inquiry",
    "createdAt": "2025-10-26T10:30:00.000Z"
  },
  "emailInfo": {
    "messageId": "<1234567890.abc@oriventa-pro-service.tn>",
    "response": "250 OK: Message accepted"
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "Missing required fields: senderName, receiverEmail, subject, body"
}
```

---

### 2. Get Inbox Messages

Retrieve received messages for a user.

**Endpoint**: `GET /inbox/:userId`

**URL Parameters**:
- `userId` (required): User ID

**Query Parameters**:
- `page` (optional): Page number, default: 1
- `limit` (optional): Items per page, default: 20

**Example**: `GET /inbox/user123?page=1&limit=20`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "msg456",
        "senderName": "HR Department",
        "senderEmail": "hr@company.com",
        "receiverEmail": "user@example.com",
        "subject": "Re: Application Inquiry",
        "threadId": "thread_abc123",
        "messageCount": 3,
        "status": "received",
        "createdAt": "2025-10-26T11:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalCount": 52,
      "limit": 20
    }
  }
}
```

---

### 3. Get Sent Messages

Retrieve sent messages for a user.

**Endpoint**: `GET /sent/:userId`

**URL Parameters**:
- `userId` (required): User ID

**Query Parameters**:
- `page` (optional): Page number, default: 1
- `limit` (optional): Items per page, default: 20

**Example**: `GET /sent/user123?page=1&limit=10`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "msg789",
        "senderName": "John Doe",
        "senderEmail": "no-reply@oriventa-pro-service.tn",
        "receiverEmail": "company@test.com",
        "subject": "Application Inquiry",
        "threadId": "thread_abc123",
        "messageCount": 3,
        "status": "sent",
        "createdAt": "2025-10-26T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalCount": 15,
      "limit": 10
    }
  }
}
```

---

### 4. Get All Messages

Retrieve all messages (sent and received) for a user.

**Endpoint**: `GET /all/:userId`

**URL Parameters**:
- `userId` (required): User ID

**Query Parameters**:
- `page` (optional): Page number, default: 1
- `limit` (optional): Items per page, default: 20

**Example**: `GET /all/user123?page=2&limit=15`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "msg001",
        "senderName": "John Doe",
        "senderEmail": "no-reply@oriventa-pro-service.tn",
        "receiverEmail": "company@test.com",
        "subject": "Follow-up",
        "status": "sent",
        "createdAt": "2025-10-26T14:00:00.000Z"
      },
      {
        "_id": "msg002",
        "senderName": "Company Reply",
        "senderEmail": "reply@company.com",
        "receiverEmail": "user@example.com",
        "subject": "Re: Follow-up",
        "status": "received",
        "createdAt": "2025-10-26T15:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 2,
      "totalPages": 5,
      "totalCount": 67,
      "limit": 15
    }
  }
}
```

---

### 5. Reply to Thread

Send a reply to an existing email thread.

**Endpoint**: `POST /reply/:threadId`

**URL Parameters**:
- `threadId` (required): Thread ID to reply to

**Request Body**:
```json
{
  "senderName": "John Doe",              // Required: Display name
  "senderEmail": "user@example.com",     // Optional: Defaults to system email
  "body": "Thank you for your response...", // Required: Reply content
  "userId": "user123"                    // Required: User ID
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Reply sent successfully",
  "data": {
    "_id": "msg999",
    "threadId": "thread_abc123",
    "senderName": "John Doe",
    "subject": "Re: Application Inquiry",
    "inReplyTo": "<original_message_id>",
    "status": "sent",
    "createdAt": "2025-10-26T16:00:00.000Z"
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "message": "Thread not found"
}
```

---

### 6. Get Conversation

Retrieve all messages in a thread (full conversation).

**Endpoint**: `GET /:threadId`

**URL Parameters**:
- `threadId` (required): Thread ID

**Example**: `GET /thread_abc123`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "threadId": "thread_abc123",
    "messageCount": 4,
    "messages": [
      {
        "_id": "msg001",
        "senderName": "John Doe",
        "senderEmail": "no-reply@oriventa-pro-service.tn",
        "receiverEmail": "company@test.com",
        "subject": "Application Inquiry",
        "body": "Hello, I am interested in...",
        "status": "sent",
        "createdAt": "2025-10-26T10:00:00.000Z"
      },
      {
        "_id": "msg002",
        "senderName": "HR Department",
        "senderEmail": "hr@company.com",
        "receiverEmail": "user@example.com",
        "subject": "Re: Application Inquiry",
        "body": "Thank you for your interest...",
        "inReplyTo": "<msg001_id>",
        "status": "received",
        "createdAt": "2025-10-26T11:00:00.000Z"
      },
      {
        "_id": "msg003",
        "senderName": "John Doe",
        "senderEmail": "no-reply@oriventa-pro-service.tn",
        "receiverEmail": "company@test.com",
        "subject": "Re: Application Inquiry",
        "body": "I would like to know more...",
        "inReplyTo": "<msg002_id>",
        "status": "sent",
        "createdAt": "2025-10-26T12:00:00.000Z"
      },
      {
        "_id": "msg004",
        "senderName": "HR Department",
        "senderEmail": "hr@company.com",
        "receiverEmail": "user@example.com",
        "subject": "Re: Application Inquiry",
        "body": "Here is additional information...",
        "inReplyTo": "<msg003_id>",
        "status": "received",
        "createdAt": "2025-10-26T13:00:00.000Z"
      }
    ]
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "message": "Thread not found"
}
```

---

### 7. Get Message Statistics

Retrieve messaging statistics for a user.

**Endpoint**: `GET /stats/:userId`

**URL Parameters**:
- `userId` (required): User ID

**Example**: `GET /stats/user123`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "sent": 42,
    "received": 38,
    "failed": 2,
    "totalThreads": 15
  }
}
```

---

### 8. Delete Message

Delete a message by ID.

**Endpoint**: `DELETE /:messageId`

**URL Parameters**:
- `messageId` (required): Message ID to delete

**Example**: `DELETE /msg123`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "message": "Message not found"
}
```

---

## Error Responses

All endpoints may return these common error responses:

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized: Invalid or missing token"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to send email",
  "error": "SMTP connection timeout"
}
```

---

## Message Status Values

Messages can have the following status values:

- `pending`: Message is being processed
- `sent`: Message was successfully sent via SMTP
- `received`: Message was received via IMAP
- `failed`: Message failed to send

---

## Threading Behavior

### Thread Creation
- When sending a new message without `threadId`, a new thread is automatically created
- Thread ID format: `thread_<timestamp>_<random>`

### Thread Replies
- When replying to a thread, all messages use the same `threadId`
- Proper email headers (`Message-ID`, `In-Reply-To`, `References`) are set
- Messages are linked chronologically

### Thread Retrieval
- Inbox/Sent endpoints group messages by thread
- Each thread shows the latest message
- `messageCount` indicates total messages in thread
- Use conversation endpoint to get full thread history

---

## Pagination

All list endpoints support pagination:

**Query Parameters**:
- `page`: Page number (1-indexed)
- `limit`: Items per page (1-100)

**Response**:
```json
{
  "pagination": {
    "currentPage": 2,
    "totalPages": 10,
    "totalCount": 195,
    "limit": 20
  }
}
```

---

## Authentication

All endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The token must contain:
- `id`: User ID
- Valid expiration time
- Proper signature

Obtain a token via the authentication endpoint:
```
POST /api/auth/login
```

---

## Rate Limiting

*(Optional - implement if needed)*

To prevent abuse, consider implementing rate limiting:
- Maximum 100 emails per user per hour
- Maximum 10 requests per second per IP

---

## Best Practices

### 1. Email Formatting
- Use HTML for rich content
- Provide text fallback for plain text clients
- Keep HTML semantic and simple
- Avoid inline styles when possible

### 2. Thread Management
- Always reply using the thread endpoint
- Don't create duplicate threads
- Use conversation endpoint for context

### 3. Error Handling
- Always check `success` field in response
- Handle network errors gracefully
- Retry failed sends with exponential backoff
- Log errors for debugging

### 4. Performance
- Use pagination for large message lists
- Cache thread conversations
- Index frequently queried fields
- Clean up old messages periodically

---

## Code Examples

### JavaScript (Fetch API)

```javascript
// Send email
async function sendEmail(messageData, token) {
  const response = await fetch('http://localhost:5000/api/messages/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(messageData)
  });
  
  const result = await response.json();
  return result;
}

// Get inbox
async function getInbox(userId, page, token) {
  const response = await fetch(
    `http://localhost:5000/api/messages/inbox/${userId}?page=${page}&limit=20`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  const result = await response.json();
  return result;
}

// Reply to thread
async function replyToThread(threadId, replyData, token) {
  const response = await fetch(
    `http://localhost:5000/api/messages/reply/${threadId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(replyData)
    }
  );
  
  const result = await response.json();
  return result;
}
```

### Node.js (Axios)

```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api/messages',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Send email
const sendEmail = async (messageData) => {
  const response = await api.post('/send', messageData);
  return response.data;
};

// Get conversation
const getConversation = async (threadId) => {
  const response = await api.get(`/${threadId}`);
  return response.data;
};
```

---

**Last Updated**: October 26, 2025  
**API Version**: 1.0.0  
**Support**: system@oriventa-pro-service.tn
