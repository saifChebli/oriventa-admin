# Email System Error Fix Guide

## Errors Encountered

### 1. SMTP Authentication Error (EAUTH)
```
Error: Invalid login: 535 Authentication failed
code: 'EAUTH'
```

### 2. Message Validation Error
```
Message validation failed: senderEmail: Path `senderEmail` is required.
```

---

## ✅ Fixes Applied

### Fix 1: Updated SMTP Configuration

**Changed in `server/services/mailService.js`:**
- Port 587 now correctly uses STARTTLS (secure: false)
- Port 465 uses SSL (secure: true)
- Auto-detection based on port number

**Changed in `server/.env`:**
```env
SMTP_HOST=pro3.mail.ovh.net
SMTP_PORT=587  # Use 587 for STARTTLS (OVH standard)
SMTP_USER=contact@oriventa-pro-service.tn
SMTP_PASS=your_actual_password_here  # MUST ADD REAL PASSWORD

IMAP_HOST=pro3.mail.ovh.net
IMAP_PORT=993
IMAP_USER=contact@oriventa-pro-service.tn
IMAP_PASS=your_actual_password_here  # MUST ADD REAL PASSWORD
IMAP_TLS=true
```

### Fix 2: SenderEmail Validation

**Already fixed in controller:**
- Default `senderEmail` now falls back to `process.env.SMTP_USER`
- Failed messages also get default senderEmail

---

## 🔧 Action Required

### **IMPORTANT: Add Your Real Password**

Edit `server/.env` and replace the placeholders:

```env
SMTP_PASS=YOUR_ACTUAL_EMAIL_PASSWORD
IMAP_PASS=YOUR_ACTUAL_EMAIL_PASSWORD
```

⚠️ **Remove the quotes** - passwords should NOT be wrapped in quotes:
```env
# ❌ WRONG
SMTP_PASS=''
SMTP_PASS='mypassword'

# ✅ CORRECT
SMTP_PASS=mypassword123
```

---

## 📋 Testing Steps

### 1. Restart the Server

```bash
cd server
npm start
```

**Check for:**
```
✅ SMTP Server is ready to send emails
✅ IMAP service initialized
✅ Server running on port 5000
```

If you see errors, check:
- Password is correct and without quotes
- Email account exists: `contact@oriventa-pro-service.tn`
- Account has SMTP/IMAP enabled

### 2. Test Sending Email

Use Postman or client interface:

```bash
POST http://localhost:5000/api/messages/send
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "senderName": "Test User",
  "receiverEmail": "recipient@example.com",
  "subject": "Test Message",
  "body": "This is a test message",
  "userId": "USER_ID_HERE"
}
```

**Note:** `senderEmail` is now **optional** - it defaults to `SMTP_USER`

---

## 🔍 Common Issues & Solutions

### Issue: Still getting EAUTH error

**Possible Causes:**

1. **Wrong Password**
   - Double-check password in `.env`
   - Try logging into webmail with same credentials
   - No quotes around password

2. **Account Locked**
   - Too many failed login attempts
   - Check OVH control panel
   - Wait 15 minutes or contact OVH support

3. **SMTP Not Enabled**
   - Log into OVH control panel
   - Verify SMTP is enabled for the email account
   - Check for any security blocks

4. **Firewall Blocking**
   - Port 587 might be blocked
   - Try port 465 instead:
     ```env
     SMTP_PORT=465
     ```
   - Check Windows Firewall settings

### Issue: Message validation error

**Solution:** Already fixed! The controller now always provides a default `senderEmail`.

### Issue: IMAP not receiving emails

**Possible Causes:**

1. **Wrong IMAP credentials**
   - Should be same as SMTP
   - Check `IMAP_USER` and `IMAP_PASS`

2. **IMAP not enabled**
   - Check OVH control panel
   - Enable IMAP access

3. **Port blocked**
   - Port 993 might be blocked
   - Check firewall

---

## 🧪 Quick Test Commands

### Test SMTP Connection (with telnet)

```bash
telnet pro3.mail.ovh.net 587
# Should connect and show: 220 pro3.mail.ovh.net ESMTP
```

### Test IMAP Connection

```bash
telnet pro3.mail.ovh.net 993
# Should connect (shows encrypted connection)
```

### Test with Real Credentials

Create a test script `server/test-email.js`:

```javascript
import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: parseInt(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Test connection
transporter.verify()
  .then(() => {
    console.log('✅ SMTP connection successful!');
    
    // Send test email
    return transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Send to yourself
      subject: 'Test Email',
      text: 'If you receive this, SMTP is working!'
    });
  })
  .then((info) => {
    console.log('✅ Test email sent:', info.messageId);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
  });
```

Run it:
```bash
node server/test-email.js
```

---

## 📧 OVH Email Setup Verification

### Check OVH Control Panel

1. Go to https://www.ovh.com/manager/
2. Navigate to **Email** section
3. Select your domain: `oriventa-pro-service.tn`
4. Click on email account: `contact@oriventa-pro-service.tn`
5. Verify:
   - ✅ Account is active
   - ✅ SMTP is enabled
   - ✅ IMAP is enabled
   - ✅ No security blocks

### Email Account Settings (OVH)

**SMTP (Outgoing):**
- Server: `pro3.mail.ovh.net` or `ssl0.ovh.net`
- Port: `587` (STARTTLS) or `465` (SSL)
- Authentication: Required
- Username: Full email address

**IMAP (Incoming):**
- Server: `pro3.mail.ovh.net` or `ssl0.ovh.net`
- Port: `993` (SSL)
- Authentication: Required
- Username: Full email address

---

## 🚀 Next Steps

1. **Add real password to `.env`** (remove quotes!)
2. **Restart server** and check logs
3. **Test with simple message** using Postman
4. **Check OVH control panel** if still failing
5. **Try test script** to isolate issue

---

## 📞 Still Having Issues?

### Check Server Logs
Look for specific error messages:
- `Invalid login` → Wrong password
- `Connection timeout` → Firewall/network issue
- `Connection refused` → Wrong host/port
- `Certificate error` → SSL/TLS issue

### Contact OVH Support
If credentials are correct but still failing:
- Contact OVH support
- Verify account has SMTP/IMAP enabled
- Check for IP restrictions
- Verify no rate limiting

---

**Last Updated:** October 26, 2025
**Status:** Fixes applied, password required
