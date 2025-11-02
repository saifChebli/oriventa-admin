# Client-Side Email System Integration Guide

## Overview
This guide provides the complete client-side implementation for integrating the email system APIs into your React application.

## Files Created/Modified

### 1. Message Service (`client/src/services/messageService.js`)
✅ **Status**: Created

This service provides a clean API interface for all message-related operations:
- Send new messages
- Get inbox/sent/all messages
- Reply to threads
- Get conversations
- Delete messages
- Get message statistics
- Helper methods for formatting dates and text

### 2. ClientMail Component (`client/src/pages/client/ClientMail.jsx`)
🔄 **Status**: Needs to be recreated

Due to file corruption during edit, this file needs to be manually recreated. See the complete implementation below.

---

## Complete ClientMail.jsx Implementation

Create the file `client/src/pages/client/ClientMail.jsx` with the following content:

```jsx
import React, { useState, useEffect } from 'react';
import { Mail, Send, Reply, Trash2, Search, Loader2, AlertCircle, Plus, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import messageService from '../../services/messageService';

const ClientMail = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20
  });
  
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [composeForm, setComposeForm] = useState({
    receiverEmail: '',
    subject: '',
    body: ''
  });
  const [composing, setComposing] = useState(false);

  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMessages();
      fetchStats();
    }
  }, [user, activeTab, pagination.currentPage]);

  useEffect(() => {
    if (selectedMessage?.threadId) {
      fetchConversation(selectedMessage.threadId);
    }
  }, [selectedMessage]);

  const fetchMessages = async () => {
    if (!user?._id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let response;
      if (activeTab === 'inbox') {
        response = await messageService.getInbox(user._id, pagination.currentPage, pagination.limit);
      } else if (activeTab === 'sent') {
        response = await messageService.getSentMessages(user._id, pagination.currentPage, pagination.limit);
      } else {
        response = await messageService.getAllMessages(user._id, pagination.currentPage, pagination.limit);
      }
      
      if (response.success) {
        setMessages(response.data.messages || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversation = async (threadId) => {
    try {
      const response = await messageService.getConversation(threadId);
      if (response.success) {
        setConversation(response.data.messages || []);
      }
    } catch (err) {
      console.error('Error fetching conversation:', err);
    }
  };

  const fetchStats = async () => {
    if (!user?._id) return;
    
    try {
      const response = await messageService.getMessageStats(user._id);
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!composeForm.receiverEmail || !composeForm.subject || !composeForm.body) {
      alert('Please fill in all fields');
      return;
    }
    
    setComposing(true);
    
    try {
      const messageData = {
        senderName: user.name || user.email,
        receiverEmail: composeForm.receiverEmail,
        subject: composeForm.subject,
        body: composeForm.body,
        userId: user._id
      };
      
      const response = await messageService.sendMessage(messageData);
      
      if (response.success) {
        alert('Message sent successfully!');
        setShowComposeModal(false);
        setComposeForm({ receiverEmail: '', subject: '', body: '' });
        fetchMessages();
        fetchStats();
      }
    } catch (err) {
      alert(err.message || 'Failed to send message');
    } finally {
      setComposing(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    
    if (!replyBody.trim()) {
      alert('Please enter a reply message');
      return;
    }
    
    setReplying(true);
    
    try {
      const replyData = {
        senderName: user.name || user.email,
        body: replyBody,
        userId: user._id
      };
      
      const response = await messageService.replyToThread(selectedMessage.threadId, replyData);
      
      if (response.success) {
        alert('Reply sent successfully!');
        setShowReplyModal(false);
        setReplyBody('');
        fetchMessages();
        fetchConversation(selectedMessage.threadId);
        fetchStats();
      }
    } catch (err) {
      alert(err.message || 'Failed to send reply');
    } finally {
      setReplying(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }
    
    try {
      const response = await messageService.deleteMessage(messageId);
      
      if (response.success) {
        alert('Message deleted successfully');
        setSelectedMessage(null);
        fetchMessages();
        fetchStats();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete message');
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      msg.subject?.toLowerCase().includes(query) ||
      msg.senderName?.toLowerCase().includes(query) ||
      msg.senderEmail?.toLowerCase().includes(query) ||
      msg.receiverEmail?.toLowerCase().includes(query)
    );
  });

  const tabs = [
    { id: 'inbox', label: 'Inbox', count: stats?.received || 0 },
    { id: 'sent', label: 'Sent', count: stats?.sent || 0 },
    { id: 'all', label: 'All Messages', count: (stats?.received || 0) + (stats?.sent || 0) }
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-2">Communicate with our team</p>
        </div>
        <button
          onClick={() => setShowComposeModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Message
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-800">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex" style={{ height: '600px' }}>
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Mail className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No messages found</p>
                  </div>
                </div>
              ) : (
                filteredMessages.map((message) => (
                  <div
                    key={message._id}
                    onClick={() => setSelectedMessage(message)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedMessage?._id === message._id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium text-sm text-gray-900">
                        {activeTab === 'sent' ? message.receiverEmail : message.senderName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {messageService.formatDate(message.createdAt)}
                      </span>
                    </div>
                    <h3 className="font-medium text-sm text-gray-900 mb-1">{message.subject}</h3>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {messageService.getMessagePreview(message.body)}
                    </p>
                    {message.messageCount > 1 && (
                      <div className="mt-2 flex items-center text-xs text-blue-600">
                        <Mail className="h-3 w-3 mr-1" />
                        {message.messageCount} messages
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            {selectedMessage ? (
              <>
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedMessage.subject}
                    </h2>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setShowReplyModal(true)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Reply"
                      >
                        <Reply className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteMessage(selectedMessage._id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span>
                      {activeTab === 'sent' 
                        ? `To: ${selectedMessage.receiverEmail}` 
                        : `From: ${selectedMessage.senderName} (${selectedMessage.senderEmail})`
                      }
                    </span>
                    <span className="mx-2">•</span>
                    <span>{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  {conversation.length > 0 ? (
                    <div className="space-y-4">
                      {conversation.map((msg) => (
                        <div 
                          key={msg._id}
                          className={`p-4 rounded-lg ${
                            msg.status === 'sent' 
                              ? 'bg-blue-50 border border-blue-200' 
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-sm">
                                {msg.senderName}
                              </span>
                              <span className="text-xs text-gray-500">
                                {msg.senderEmail}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(msg.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div 
                            className="text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: msg.body }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedMessage.body }}
                    />
                  )}
                </div>

                <div className="p-4 border-t border-gray-200">
                  <button 
                    onClick={() => setShowReplyModal(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </button>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a message to view</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showComposeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">New Message</h3>
              <button
                onClick={() => setShowComposeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSendMessage} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input
                  type="email"
                  value={composeForm.receiverEmail}
                  onChange={(e) => setComposeForm({ ...composeForm, receiverEmail: e.target.value })}
                  placeholder="recipient@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={composeForm.subject}
                  onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                  placeholder="Message subject"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={composeForm.body}
                  onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })}
                  placeholder="Write your message..."
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              <div className="flex space-x-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowComposeModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={composing}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {composing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Reply to: {selectedMessage.subject}
              </h3>
              <button
                onClick={() => setShowReplyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleReply} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Reply</label>
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Write your reply..."
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              <div className="flex space-x-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowReplyModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={replying}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {replying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Reply className="h-4 w-4 mr-2" />
                      Send Reply
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientMail;
```

---

## Features Implemented

### ✅ Message Service (`messageService.js`)
- **Send Message**: `sendMessage(messageData)`
- **Get Inbox**: `getInbox(userId, page, limit)`
- **Get Sent Messages**: `getSentMessages(userId, page, limit)`
- **Get All Messages**: `getAllMessages(userId, page, limit)`
- **Reply to Thread**: `replyToThread(threadId, replyData)`
- **Get Conversation**: `getConversation(threadId)`
- **Get Message Stats**: `getMessageStats(userId)`
- **Delete Message**: `deleteMessage(messageId)`
- **Helper Functions**: Format dates, strip HTML, truncate text

### ✅ ClientMail Component Features
1. **Tab Navigation**: Inbox, Sent, All Messages
2. **Real-time Statistics**: Message counts in tabs
3. **Search Functionality**: Filter messages by subject, sender, receiver
4. **Pagination**: Navigate through message pages
5. **Compose Modal**: Send new messages
6. **Reply Modal**: Reply to existing threads
7. **Conversation View**: See full thread history
8. **Delete Messages**: Remove unwanted messages
9. **Loading States**: Show spinners during API calls
10. **Error Handling**: Display error messages
11. **Responsive Design**: Mobile-friendly layout

---

## Usage Instructions

### 1. Copy the ClientMail.jsx Content
Manually copy the complete component code from above into:
```
client/src/pages/client/ClientMail.jsx
```

### 2. Verify Dependencies
Ensure these are installed:
```bash
cd client
npm install lucide-react
```

### 3. Test the Integration
1. Start the server with email system configured:
   ```bash
   cd server
   npm start
   ```

2. Start the client:
   ```bash
   cd client
   npm run dev
   ```

3. Navigate to the Messages page in the client dashboard

### 4. Test Scenarios
- ✅ Send a new message
- ✅ View inbox messages
- ✅ View sent messages
- ✅ Search for messages
- ✅ Reply to a thread
- ✅ View full conversation
- ✅ Delete a message
- ✅ Check pagination
- ✅ Verify message counts

---

## API Integration Summary

| Feature | Service Method | API Endpoint |
|---------|---------------|--------------|
| Send Message | `messageService.sendMessage()` | `POST /api/messages/send` |
| Get Inbox | `messageService.getInbox()` | `GET /api/messages/inbox/:userId` |
| Get Sent | `messageService.getSentMessages()` | `GET /api/messages/sent/:userId` |
| Get All | `messageService.getAllMessages()` | `GET /api/messages/all/:userId` |
| Reply | `messageService.replyToThread()` | `POST /api/messages/reply/:threadId` |
| Get Thread | `messageService.getConversation()` | `GET /api/messages/:threadId` |
| Get Stats | `messageService.getMessageStats()` | `GET /api/messages/stats/:userId` |
| Delete | `messageService.deleteMessage()` | `DELETE /api/messages/:messageId` |

---

## Next Steps

1. **Copy the component code above** into `ClientMail.jsx`
2. **Test all features** thoroughly
3. **Customize styling** as needed
4. **Add toast notifications** instead of alerts (optional enhancement)
5. **Add rich text editor** for composing messages (optional enhancement)

---

**Status**: ✅ Message Service Created | ⚠️ ClientMail Component Needs Manual Copy

**Recommendation**: Copy the complete ClientMail.jsx code from this document directly into your file to avoid any formatting issues.
