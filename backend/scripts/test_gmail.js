require('dotenv').config();
const nodemailer = require('nodemailer');

const testGmail = async () => {
  console.log('Testing Gmail Configuration...');
  console.log('User:', process.env.GMAIL_USER);
  console.log('Password Length:', process.env.GMAIL_PASS ? process.env.GMAIL_PASS.length : 0);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  try {
    // Verify connection configuration
    await transporter.verify();
    console.log('✅ Gmail SMTP Connection Successful');

    // Send test email
    const testRecipient = process.env.GMAIL_USER; 
    
    console.log(`Attempting to send test email to ${testRecipient}...`);
    
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: testRecipient,
      subject: "MediTRACKNG Gmail Test",
      text: "If you receive this, your Gmail configuration is working correctly.",
    });

    console.log("✅ Message sent: %s", info.messageId);
  } catch (error) {
    console.error("❌ Error:", error);
  }
};

testGmail();
