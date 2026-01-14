// testSMTP.js
require("dotenv").config({ path: '../../../.env' });
const nodemailer = require("nodemailer");


console.log("SMTP_HOST:", process.env.SMTP_HOST);
console.log("SMTP_PORT:", process.env.SMTP_PORT);
console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("EMAIL_FROM:", process.env.EMAIL_FROM);

/**async function testSMTP() {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // true if using port 465
      auth: {
        user: process.env.SMTP_USER, // must be "apikey"
        pass: process.env.SMTP_PASS, // your SMTP key
      },
    });

    // verify connection
    await transporter.verify();
    console.log("✅ SMTP connection successful!");

    // send test email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,  // must be verified in Brevo
      to: process.env.EMAIL_FROM,    // send to yourself for test
      subject: "Brevo SMTP Test Email",
      html: "<h2>SMTP is working ✅</h2>",
    });

    console.log("✅ Test email sent successfully!");

  } catch (error) {
    console.error("❌ SMTP test failed:", error);
  }
}

testSMTP();**/



















const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com", // Brave / Brevo SMTP host
  port: 465,                     // 587 for TLS, 465 for SSL
  secure: true,                 // true if using port 465
  auth: {
  user: process.env.SMTP_USER, // should be "apikey"
  pass: process.env.SMTP_PASS// your API key stored in env variable
  },
});

const sendEmail = async ({ to, subject, html }) => {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,  // must be verified in Brevo
    to,
    subject,
    html,
  });
};
module.exports = sendEmail;