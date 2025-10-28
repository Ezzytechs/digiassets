const EventEmitter = require("events");
const { sendEmail } = require("../mailer/mailer");
const credentials = require("../../configs/credentials");

class EmailObserver extends EventEmitter {}

const emailObserver = new EmailObserver();

// 🔔 Listen for SEND_MAIL events
emailObserver.on("SEND_MAIL", ({ to, subject, templateFunc, templateData }) => {
  (async () => {
    try {
      // Generate HTML using provided template
      const html = templateFunc(templateData);
      // Send email
      const info = await sendEmail({
        to,
        subject,
        html,
      });

      console.log("✅ Email sent:", info.messageId || info.response);
    } catch (err) {
      console.error(`❌ Failed to send email to ${to}:`, err.message);
    }
  })();
});

module.exports = emailObserver;
