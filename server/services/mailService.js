import nodemailer from 'nodemailer';
import 'dotenv/config';

/**
 * Mail Service
 * Handles all outgoing email operations using Nodemailer
 * Supports both text and HTML email templates
 * 
 * Configuration via environment variables:
 * - SMTP_HOST: SMTP server hostname
 * - SMTP_PORT: SMTP server port (usually 465 for SSL, 587 for TLS)
 * - SMTP_USER: SMTP authentication username (email address)
 * - SMTP_PASS: SMTP authentication password
 * - SMTP_FROM: Default "from" email address
 */

class MailService {
  constructor() {
    const smtpPort = parseInt(process.env.SMTP_PORT) || 465;
    const isSecure = smtpPort === 465; // SSL for 465, STARTTLS for 587
    
    // Initialize Nodemailer transporter with SMTP configuration
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.oriventa-pro-service.tn',
      port: smtpPort,
      secure: isSecure, // true for 465 (SSL), false for 587 (STARTTLS)
      auth: {
        user: process.env.SMTP_USER || 'no-reply@oriventa-pro-service.tn',
        pass: process.env.SMTP_PASS
      },
      // Additional options for better deliverability
      tls: {
        rejectUnauthorized: false // Accept self-signed certificates if needed
      },
      debug: process.env.NODE_ENV === 'development', // Enable debug output in development
      logger: process.env.NODE_ENV === 'development' // Enable logging in development
    });

    // Verify SMTP connection on initialization
    this.verifyConnection();
  }

  /**
   * Verify SMTP connection
   * Logs connection status to console
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ SMTP Server is ready to send emails');
    } catch (error) {
      console.error('❌ SMTP Connection Error:', error.message);
      console.error('Check your SMTP credentials in .env file');
    }
  }

  /**
   * Send a plain text email
   * 
   * @param {Object} options - Email options
   * @param {String} options.from - Sender email address (defaults to SMTP_USER)
   * @param {String} options.fromName - Sender display name
   * @param {String} options.to - Recipient email address
   * @param {String} options.subject - Email subject
   * @param {String} options.text - Plain text body
   * @param {String} options.messageId - Custom Message-ID header
   * @param {String} options.inReplyTo - Message-ID this email is replying to
   * @param {String} options.references - Message-IDs of previous messages in thread
   * @returns {Promise<Object>} - Nodemailer send result
   */
  async sendTextEmail({ from, fromName, to, subject, text, messageId, inReplyTo, references }) {
    try {
      // IMPORTANT: 'from' must be the authenticated SMTP account
      // Custom user email goes in 'replyTo' field
      const systemEmail = process.env.SMTP_USER;
      const replyToEmail = from || systemEmail; // User's email for replies
      const displayName = fromName ? `${fromName}` : 'Oriventa Pro Service';
      
      const mailOptions = {
        from: `"${displayName}" <${systemEmail}>`, // Always use system email
        replyTo: replyToEmail, // User's email - replies go here
        to,
        subject,
        text,
        messageId,
        inReplyTo,
        references
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Text Email sent from ${systemEmail} (Reply-To: ${replyToEmail}):`, info.messageId);
      return {
        success: true,
        messageId: info.messageId,
        response: info.response
      };
    } catch (error) {
      console.error('❌ Error sending text email:', error.message);
      throw error;
    }
  }

  /**
   * Send an HTML email
   * 
   * @param {Object} options - Email options
   * @param {String} options.from - Sender email address (defaults to SMTP_USER)
   * @param {String} options.fromName - Sender display name
   * @param {String} options.to - Recipient email address
   * @param {String} options.subject - Email subject
   * @param {String} options.html - HTML body
   * @param {String} options.text - Plain text fallback (optional)
   * @param {String} options.messageId - Custom Message-ID header
   * @param {String} options.inReplyTo - Message-ID this email is replying to
   * @param {String} options.references - Message-IDs of previous messages in thread
   * @param {Array} options.attachments - Array of attachment objects
   * @returns {Promise<Object>} - Nodemailer send result
   */
  async sendHtmlEmail({ from, fromName, to, subject, html, text, messageId, inReplyTo, references, attachments }) {
    try {
      // IMPORTANT: 'from' must be the authenticated SMTP account
      // Custom user email goes in 'replyTo' field
      const systemEmail = process.env.SMTP_USER;
      const replyToEmail = from || systemEmail; // User's email for replies
      const displayName = fromName ? `${fromName}` : 'Oriventa Pro Service';
      
      const mailOptions = {
        from: `"${displayName}"`, // Always use system email
        replyTo: replyToEmail, // User's email - replies go here
        to,
        subject,
        html,
        text: text || this.stripHtml(html), // Auto-generate text version if not provided
        messageId,
        inReplyTo,
        references,
        attachments
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ HTML Email sent from ${systemEmail} (Reply-To: ${replyToEmail}):`, info.messageId);
      return {
        success: true,
        messageId: info.messageId,
        response: info.response
      };
    } catch (error) {
      console.error('❌ Error sending HTML email:', error.message);
      throw error;
    }
  }

  /**
   * Send an email with automatic format detection
   * Detects if body contains HTML tags and sends accordingly
   * 
   * @param {Object} options - Email options
   * @param {String} options.from - Sender email address
   * @param {String} options.fromName - Sender display name
   * @param {String} options.to - Recipient email address
   * @param {String} options.subject - Email subject
   * @param {String} options.body - Email body (HTML or text)
   * @param {String} options.messageId - Custom Message-ID header
   * @param {String} options.inReplyTo - Message-ID this email is replying to
   * @param {String} options.references - Message-IDs of previous messages in thread
   * @param {Array} options.attachments - Array of attachment objects
   * @returns {Promise<Object>} - Send result
   */
  async sendEmail({ from, fromName, to, subject, body, messageId, inReplyTo, references, attachments }) {
    const isHtml = this.detectHtml(body);

    if (isHtml) {
      return await this.sendHtmlEmail({ 
        from, 
        fromName, 
        to, 
        subject, 
        html: body, 
        messageId, 
        inReplyTo, 
        references,
        attachments 
      });
    } else {
      return await this.sendTextEmail({ 
        from, 
        fromName, 
        to, 
        subject, 
        text: body, 
        messageId, 
        inReplyTo, 
        references 
      });
    }
  }

  /**
   * Send a templated email
   * Uses predefined HTML templates
   * 
   * @param {String} templateName - Name of the template to use
   * @param {Object} templateData - Data to inject into template
   * @param {Object} emailOptions - Standard email options (to, subject, etc.)
   * @returns {Promise<Object>} - Send result
   */
  async sendTemplatedEmail(templateName, templateData, emailOptions) {
    const html = this.getTemplate(templateName, templateData);
    return await this.sendHtmlEmail({
      ...emailOptions,
      html
    });
  }

  /**
   * Get HTML template by name
   * 
   * @param {String} templateName - Template identifier
   * @param {Object} data - Data to inject into template
   * @returns {String} - Rendered HTML
   */
  getTemplate(templateName, data) {
    const templates = {
      // Welcome email template
      welcome: (data) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1E40AF; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9fafb; padding: 30px; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            .button { display: inline-block; padding: 12px 24px; background-color: #1E40AF; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Oriventa Pro Service</h1>
            </div>
            <div class="content">
              <p>Hello ${data.name || 'there'},</p>
              <p>${data.message || 'Welcome to our platform!'}</p>
              ${data.actionUrl ? `<a href="${data.actionUrl}" class="button">${data.actionText || 'Get Started'}</a>` : ''}
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Oriventa Pro Service. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,

      // Generic notification template
      notification: (data) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1E40AF; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9fafb; padding: 30px; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${data.title || 'Notification'}</h2>
            </div>
            <div class="content">
              ${data.body || ''}
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Oriventa Pro Service. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,

      // Reply template
      reply: (data) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .reply { background-color: #f9fafb; padding: 20px; margin: 20px 0; border-left: 4px solid #1E40AF; }
            .original { background-color: #f3f4f6; padding: 15px; margin-top: 20px; border-left: 3px solid #9CA3AF; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="reply">
              <p><strong>From: ${data.senderName || 'Sender'}</strong></p>
              <div>${data.replyBody || ''}</div>
            </div>
            ${data.originalBody ? `
              <div class="original">
                <p><strong>Original Message:</strong></p>
                <div>${data.originalBody}</div>
              </div>
            ` : ''}
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Oriventa Pro Service. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    return templates[templateName] ? templates[templateName](data) : data.body || '';
  }

  /**
   * Detect if a string contains HTML tags
   * 
   * @param {String} str - String to check
   * @returns {Boolean}
   */
  detectHtml(str) {
    const htmlRegex = /<\/?[a-z][\s\S]*>/i;
    return htmlRegex.test(str);
  }

  /**
   * Strip HTML tags from a string
   * Basic implementation for generating plain text from HTML
   * 
   * @param {String} html - HTML string
   * @returns {String} - Plain text
   */
  stripHtml(html) {
    return html
      .replace(/<style[^>]*>.*<\/style>/gm, '')
      .replace(/<script[^>]*>.*<\/script>/gm, '')
      .replace(/<[^>]+>/gm, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Generate a unique Message-ID
   * Format: <timestamp.random@domain>
   * 
   * @returns {String} - Message-ID
   */
  generateMessageId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const domain = process.env.SMTP_USER?.split('@')[1] || 'oriventa-pro-service.tn';
    return `<${timestamp}.${random}@${domain}>`;
  }
}

// Export a singleton instance
const mailService = new MailService();
export default mailService;
