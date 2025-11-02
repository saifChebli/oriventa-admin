import nodemailer from 'nodemailer';
import 'dotenv/config';

console.log('🔍 Testing SMTP Configuration...\n');

// Display configuration (without password)
console.log('Configuration:');
console.log('  SMTP_HOST:', process.env.SMTP_HOST || 'NOT SET');
console.log('  SMTP_PORT:', process.env.SMTP_PORT || 'NOT SET');
console.log('  SMTP_USER:', process.env.SMTP_USER || 'NOT SET');
console.log('  SMTP_PASS:', process.env.SMTP_PASS ? '******' : 'NOT SET');
console.log('');

if (!process.env.SMTP_PASS || process.env.SMTP_PASS === 'your_actual_password_here') {
  console.error('❌ ERROR: SMTP_PASS is not set in .env file!');
  console.error('   Please add your actual email password to server/.env');
  process.exit(1);
}

const smtpPort = parseInt(process.env.SMTP_PORT) || 587;
const isSecure = smtpPort === 465;

console.log(`📧 Creating transporter (Port ${smtpPort}, Secure: ${isSecure})...\n`);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: isSecure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  },
  debug: true,
  logger: true
});

// Test 1: Verify connection
console.log('🔌 Testing SMTP connection...');
transporter.verify()
  .then(() => {
    console.log('✅ SMTP connection successful!\n');
    
    // Test 2: Send a test email
    console.log('📤 Sending test email...');
    return transporter.sendMail({
      from: `"Test Sender" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to yourself
      subject: 'SMTP Test Email - ' + new Date().toLocaleString(),
      text: 'If you receive this email, your SMTP configuration is working correctly!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #4CAF50;">✅ SMTP Test Successful!</h2>
          <p>If you receive this email, your SMTP configuration is working correctly.</p>
          <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>From:</strong> ${process.env.SMTP_USER}</p>
          <p><strong>SMTP Host:</strong> ${process.env.SMTP_HOST}</p>
          <p><strong>SMTP Port:</strong> ${process.env.SMTP_PORT}</p>
        </div>
      `
    });
  })
  .then((info) => {
    console.log('✅ Test email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    console.log('\n🎉 All tests passed! Your email system is ready to use.');
  })
  .catch((error) => {
    console.error('\n❌ Error occurred:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code || 'N/A');
    
    if (error.code === 'EAUTH') {
      console.error('\n💡 AUTHENTICATION FAILED - Possible solutions:');
      console.error('   1. Check your email password is correct in .env');
      console.error('   2. Ensure password has no quotes around it');
      console.error('   3. Try logging into webmail with same credentials');
      console.error('   4. Check if SMTP is enabled in your email account');
      console.error('   5. Wait 15 minutes if too many failed attempts');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.error('\n💡 CONNECTION FAILED - Possible solutions:');
      console.error('   1. Check SMTP_HOST is correct:', process.env.SMTP_HOST);
      console.error('   2. Check SMTP_PORT is correct:', process.env.SMTP_PORT);
      console.error('   3. Check firewall settings');
      console.error('   4. Try alternative port (465 or 587)');
    } else {
      console.error('\n💡 For more help, check EMAIL_ERROR_FIX.md');
    }
    
    process.exit(1);
  });
