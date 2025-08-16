// observers/emailObserver.js
const EventEmitter = require("events");
const { sendEmail } = require("../mailer/mailer");
const emailTemplates = require("../mailer/templates");
const credentials = require("../../configs/credentials");

class EmailObserver extends EventEmitter {}

const emailObserver = new EmailObserver();

emailObserver.on("SEND_MAIL", async ({ to, subject, templateFunc }) => {
  try {
    const html = templateFunc()

   sendEmail({
      from: credentials.mail.auth.user,
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent to ${to} with subject: ${subject}`);
  } catch (err) {
    console.error(`❌ Failed to send email to ${to}:`, err.message);
  }
});

module.exports = emailObserver;
