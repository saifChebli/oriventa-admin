import api from '../../api';

/**
 * Message Service
 * Handles all email/message related API calls
 */

class MessageService {
  /**
   * Send a new email message
   * @param {Object} messageData - Message details
   * @param {string} messageData.senderName - Display name of sender
   * @param {string} messageData.senderEmail - Email of sender (optional)
   * @param {string} messageData.receiverEmail - Email of receiver
   * @param {string} messageData.subject - Email subject
   * @param {string} messageData.body - Email content (HTML or text)
   * @param {string} messageData.userId - User ID
   * @param {string} messageData.threadId - Thread ID (optional, for existing threads)
   * @returns {Promise<Object>} Response with sent message data
   */
  async sendMessage(messageData) {
    try {
      const response = await api.post('/api/messages/send', messageData);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get inbox messages for a user
   * @param {string} userId - User ID
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 20)
   * @returns {Promise<Object>} Response with inbox messages and pagination
   */
  async getInbox(userId, page = 1, limit = 20) {
    try {
      const response = await api.get(`/api/messages/inbox/${userId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching inbox:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get sent messages for a user
   * @param {string} userId - User ID
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 20)
   * @returns {Promise<Object>} Response with sent messages and pagination
   */
  async getSentMessages(userId, page = 1, limit = 20) {
    try {
      const response = await api.get(`/api/messages/sent/${userId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching sent messages:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get all messages (inbox + sent) for a user
   * @param {string} userId - User ID
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 20)
   * @returns {Promise<Object>} Response with all messages and pagination
   */
  async getAllMessages(userId, page = 1, limit = 20) {
    try {
      const response = await api.get(`/api/messages/all/${userId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all messages:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Reply to an existing thread
   * @param {string} threadId - Thread ID to reply to
   * @param {Object} replyData - Reply details
   * @param {string} replyData.senderName - Display name of sender
   * @param {string} replyData.senderEmail - Email of sender (optional)
   * @param {string} replyData.body - Reply content
   * @param {string} replyData.userId - User ID
   * @returns {Promise<Object>} Response with sent reply data
   */
  async replyToThread(threadId, replyData) {
    try {
      const response = await api.post(`/api/messages/reply/${threadId}`, replyData);
      return response.data;
    } catch (error) {
      console.error('Error sending reply:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get full conversation for a thread
   * @param {string} threadId - Thread ID
   * @returns {Promise<Object>} Response with all messages in the thread
   */
  async getConversation(threadId) {
    try {
      const response = await api.get(`/api/messages/${threadId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get message statistics for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Response with message statistics
   */
  async getMessageStats(userId) {
    try {
      const response = await api.get(`/api/messages/stats/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching message stats:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Delete a message
   * @param {string} messageId - Message ID to delete
   * @returns {Promise<Object>} Response confirming deletion
   */
  async deleteMessage(messageId) {
    try {
      const response = await api.delete(`/api/messages/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Format date for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  /**
   * Strip HTML tags from content
   * @param {string} html - HTML content
   * @returns {string} Plain text
   */
  stripHtml(html) {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  /**
   * Truncate text to specified length
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length (default: 100)
   * @returns {string} Truncated text
   */
  truncateText(text, maxLength = 100) {
    if (!text) return '';
    const plainText = this.stripHtml(text);
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  }

  /**
   * Get message preview
   * @param {string} body - Message body (HTML or text)
   * @returns {string} Preview text
   */
  getMessagePreview(body) {
    return this.truncateText(body, 80);
  }
}

// Export singleton instance
const messageService = new MessageService();
export default messageService;
