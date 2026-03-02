const nodemailer = require("nodemailer");

async function sendEmail() {
  // Generate a test account
  const testAccount = await nodemailer.createTestAccount();

  console.log("Test account created:");
  console.log("  User: %s", testAccount.user);
  console.log("  Pass: %s", testAccount.pass);

  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'tyrique93@ethereal.email',
      pass: '2FSC1QKEfuzqprZ1kN',
    },
  });

  // Send a test message
  const info = await transporter.sendMail({
    from: `alkhat@gmail.com`,
    to: "kalpanabarde97@gmail.com",
    subject: "OTP send to mail!",
    text: "This message was sent using Ethereal.",
    html: "<p>This message was sent using <b>Ethereal</b>.</p>",
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview: %s", nodemailer.getTestMessageUrl(info));
}

sendEmail().catch(console.error);